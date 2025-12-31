const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkAndAwardPoints() {
  console.log('🧐 Checking diary posts...');
  const postsRef = db.collection('diary_posts');
  const snapshot = await postsRef.orderBy('timestamp', 'asc').get();
  
  if (snapshot.empty) {
    console.log('No posts found.');
    return;
  }

  const userDailyCounts = {}; // { userId: { date: count } }
  const updates = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const authorId = data.author.id;
    const timestamp = data.timestamp ? data.timestamp.toDate() : new Date();
    const dateKey = timestamp.toISOString().split('T')[0];

    if (!userDailyCounts[authorId]) userDailyCounts[authorId] = {};
    if (!userDailyCounts[authorId][dateKey]) userDailyCounts[authorId][dateKey] = 0;

    const count = userDailyCounts[authorId][dateKey];
    const hasPhoto = !!data.media;
    const hasCaption = !!(data.content && data.content.trim());
    
    let points = 0;
    if (hasPhoto && hasCaption) {
      if (count === 0) points = 3;
      else if (count === 1) points = 2;
      else if (count === 2) points = 1;
      else points = 0.1;
    } else {
      if (count === 0) points = 2;
      else if (count === 1) points = 1;
      else if (count === 2) points = 0.5;
      else points = 0.1;
    }

    userDailyCounts[authorId][dateKey]++;

    if (data.points === undefined) {
      console.log(`Updating post ${doc.id} by ${data.author.name} on ${dateKey}: ${points} points`);
      updates.push(doc.ref.update({ points: points }));
    } else {
      console.log(`Post ${doc.id} already has ${data.points} points`);
    }
  }

  if (updates.length > 0) {
    await Promise.all(updates);
    console.log(`✅ Updated ${updates.length} posts with points.`);
  } else {
    console.log('✅ All posts already have points.');
  }
}

checkAndAwardPoints().catch(console.error);
