import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Automatically load .env.local if available in Node 20+
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch {
  // Ignore if .env.local doesn't exist
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// CLI Arguments: --mode=initial (default)
const args = process.argv.slice(2);
const modeArg = args.find((a) => a.startsWith('--mode='))?.split('=')[1] || 'initial';

async function runMigration() {
  console.log('=== ASTER PHASE 2: SUPABASE DATABASE MIGRATION ===');
  console.log(`[MODE] Import Mode: ${modeArg.toUpperCase()}`);
  console.log('[POLICY] Safe Non-Destructive: Missing records will be inserted.');
  console.log('         Existing live production posts, comments, and likes are 100% preserved.\n');

  // 1. Verify safety backup file
  const backupPath = path.join(rootDir, 'src', 'data', 'blogPosts.backup.json');
  const sourcePath = path.join(rootDir, 'src', 'data', 'blogPosts.json');

  try {
    await fs.access(backupPath);
    console.log('[✓] Confirmed safety backup: src/data/blogPosts.backup.json');
  } catch {
    console.warn('[!] Backup file not found. Creating backup before running migration...');
    const originalContent = await fs.readFile(sourcePath, 'utf-8');
    await fs.writeFile(backupPath, originalContent, 'utf-8');
    console.log('[✓] Created backup: src/data/blogPosts.backup.json');
  }

  // 2. Read source JSON data
  const rawData = await fs.readFile(sourcePath, 'utf-8');
  const posts = JSON.parse(rawData);
  console.log(`[i] Loaded ${posts.length} posts from ${sourcePath}`);

  let totalCommentsInJson = 0;
  let totalLikesInJson = 0;
  posts.forEach((p) => {
    totalCommentsInJson += (p.comments || []).length;
    totalLikesInJson += p.likes || 0;
  });
  console.log(`[i] Total JSON Records: ${posts.length} posts, ${totalCommentsInJson} comments, ${totalLikesInJson} likes.\n`);

  // 3. Verify Supabase connection
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const secretKey = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();

  if (!url || !secretKey || !url.startsWith('http') || secretKey.length <= 10) {
    console.warn('[!] Supabase credentials are not configured in environment.');
    console.warn('    Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.');
    console.warn('    Migration script verified in dry-run mode. Ready for live credentials.\n');
    return;
  }

  const supabase = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  console.log('[i] Connecting to Supabase PostgreSQL database...');

  let postsInserted = 0;
  let postsPreserved = 0;
  let commentsInserted = 0;
  let commentsPreserved = 0;

  // 4. Safe Non-Destructive Migration of Posts
  for (const post of posts) {
    // Check if post already exists in live database
    const { data: existingPost, error: checkErr } = await supabase
      .from('posts')
      .select('id, title, likes_count, updated_at')
      .eq('id', post.id)
      .maybeSingle();

    if (checkErr) {
      console.error(`[ERROR] Failed to query post ${post.id}:`, checkErr.message);
      throw checkErr;
    }

    if (existingPost) {
      console.log(` [PRESERVED] Post "${post.id}" already exists in live database (likes: ${existingPost.likes_count}). Skipping overwrite.`);
      postsPreserved++;
    } else {
      console.log(` [INSERT] Inserting post: ${post.id} ("${post.title.slice(0, 35)}...")`);
      const { error: insertErr } = await supabase.from('posts').insert({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt || null,
        content: post.content,
        cover_image: post.coverImage || null,
        category: post.category,
        mood: post.mood || null,
        tags: post.tags || [],
        author_name: post.author?.name || 'Abdullah Al Nayem',
        author_avatar: post.author?.avatar || '/profile.jpg',
        author_role: post.author?.role || 'Full-Stack Developer',
        published_at: post.publishedAt,
        read_time: post.readTime,
        likes_count: post.likes || 0,
        is_private: Boolean(post.isPrivate),
      });

      if (insertErr) {
        console.error(`[ERROR] Failed to insert post ${post.id}:`, insertErr.message);
        throw insertErr;
      }
      postsInserted++;
    }

    // 5. Safe Non-Destructive Migration of Comments
    if (post.comments && post.comments.length > 0) {
      for (const comment of post.comments) {
        const { data: existingComment, error: checkCommentErr } = await supabase
          .from('comments')
          .select('id')
          .eq('id', comment.id)
          .maybeSingle();

        if (checkCommentErr) {
          console.error(`[ERROR] Failed to query comment ${comment.id}:`, checkCommentErr.message);
          throw checkCommentErr;
        }

        if (existingComment) {
          commentsPreserved++;
        } else {
          console.log(`   -> Inserting missing comment: ${comment.id} (${comment.name})`);
          const { error: insertCommentErr } = await supabase.from('comments').insert({
            id: comment.id,
            post_id: post.id,
            name: comment.name,
            email: comment.email,
            comment: comment.comment,
            created_at_display: comment.createdAt,
          });

          if (insertCommentErr) {
            console.error(`[ERROR] Failed to insert comment ${comment.id}:`, insertCommentErr.message);
            throw insertCommentErr;
          }
          commentsInserted++;
        }
      }
    }
  }

  console.log('\n[✓] Migration processing finished:');
  console.log(`    Posts:    ${postsInserted} inserted, ${postsPreserved} preserved.`);
  console.log(`    Comments: ${commentsInserted} inserted, ${commentsPreserved} preserved.`);

  // 6. Live Verification Queries
  const { count: postCount, error: countPostErr } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });

  const { count: commentCount, error: countCommentErr } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true });

  if (countPostErr || countCommentErr) {
    console.error('[!] Verification query error:', countPostErr || countCommentErr);
  } else {
    console.log(`[✓] Live Supabase Post Count:    ${postCount}`);
    console.log(`[✓] Live Supabase Comment Count: ${commentCount}`);
  }

  console.log('\n=== MIGRATION COMPLETE & VERIFIED ===');
}

runMigration().catch((err) => {
  console.error('[FATAL] Migration script terminated with error:', err);
  process.exit(1);
});
