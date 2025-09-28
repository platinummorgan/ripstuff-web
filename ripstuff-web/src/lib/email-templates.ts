// Email template utilities for notification system

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface NewSympathyEmailData {
  graveName: string;
  graveSlug: string;
  sympathyAuthor: string;
  sympathyMessage: string;
  graveUrl: string;
}

export interface FirstReactionEmailData {
  graveName: string;
  graveSlug: string;
  reactionType: string;
  reactorName: string;
  graveUrl: string;
}

export interface DailyDigestEmailData {
  graveName: string;
  graveSlug: string;
  graveUrl: string;
  sympathyCount: number;
  reactionCount: number;
  uniqueVisitors: number;
  newSympathies: Array<{
    author: string;
    message: string;
    createdAt: string;
  }>;
  topReactions: Array<{
    type: string;
    count: number;
  }>;
}

export function generateNewSympathyEmail(data: NewSympathyEmailData): EmailTemplate {
  const subject = `New sympathy left for ${data.graveName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; }
        .header { background: #1a1a2e; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .sympathy-box { background: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin: 15px 0; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Virtual Graveyard</h1>
          <p>New sympathy notification</p>
        </div>
        <div class="content">
          <h2>Someone left a sympathy for ${data.graveName}</h2>
          <p><strong>${data.sympathyAuthor}</strong> shared their condolences:</p>
          <div class="sympathy-box">
            "${data.sympathyMessage}"
          </div>
          <p>
            <a href="${data.graveUrl}" class="button">View Memorial</a>
          </p>
        </div>
        <div class="footer">
          <p>You're receiving this because you have notifications enabled for your memorials.</p>
          <p><a href="${data.graveUrl.replace('/grave/', '/profile')}">Update notification preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
${subject}

${data.sympathyAuthor} left a sympathy for ${data.graveName}:

"${data.sympathyMessage}"

View the memorial: ${data.graveUrl}

---
You're receiving this because you have notifications enabled for your memorials.
Update your preferences: ${data.graveUrl.replace('/grave/', '/profile')}
  `;

  return { subject, html, text };
}

export function generateFirstReactionEmail(data: FirstReactionEmailData): EmailTemplate {
  const subject = `First ${data.reactionType} reaction for ${data.graveName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; }
        .header { background: #1a1a2e; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .reaction-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; text-align: center; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Virtual Graveyard</h1>
          <p>First daily reaction notification</p>
        </div>
        <div class="content">
          <h2>First reaction of the day for ${data.graveName}</h2>
          <div class="reaction-box">
            <p><strong>${data.reactorName}</strong> reacted with <strong>${data.reactionType}</strong></p>
          </div>
          <p>This is the first reaction from a unique visitor today.</p>
          <p>
            <a href="${data.graveUrl}" class="button">View Memorial</a>
          </p>
        </div>
        <div class="footer">
          <p>You're receiving this because you have notifications enabled for your memorials.</p>
          <p><a href="${data.graveUrl.replace('/grave/', '/profile')}">Update notification preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
${subject}

${data.reactorName} left a ${data.reactionType} reaction for ${data.graveName}.

This is the first reaction from a unique visitor today.

View the memorial: ${data.graveUrl}

---
You're receiving this because you have notifications enabled for your memorials.
Update your preferences: ${data.graveUrl.replace('/grave/', '/profile')}
  `;

  return { subject, html, text };
}

export function generateDailyDigestEmail(data: DailyDigestEmailData): EmailTemplate {
  const subject = `Daily activity summary for ${data.graveName}`;
  
  const activitySummary = [];
  if (data.sympathyCount > 0) activitySummary.push(`${data.sympathyCount} new sympathy message${data.sympathyCount > 1 ? 's' : ''}`);
  if (data.reactionCount > 0) activitySummary.push(`${data.reactionCount} reaction${data.reactionCount > 1 ? 's' : ''}`);
  if (data.uniqueVisitors > 0) activitySummary.push(`${data.uniqueVisitors} unique visitor${data.uniqueVisitors > 1 ? 's' : ''}`);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; }
        .header { background: #1a1a2e; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat { text-align: center; padding: 10px; }
        .stat-number { font-size: 24px; font-weight: bold; color: #007bff; }
        .sympathy-list { background: #f8f9fa; padding: 15px; margin: 15px 0; }
        .sympathy { border-bottom: 1px solid #ddd; padding: 10px 0; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Virtual Graveyard</h1>
          <p>Daily digest for ${data.graveName}</p>
        </div>
        <div class="content">
          <h2>Yesterday's Activity Summary</h2>
          <p>${activitySummary.join(', ')}</p>
          
          <div class="stats">
            <div class="stat">
              <div class="stat-number">${data.sympathyCount}</div>
              <div>New Sympathies</div>
            </div>
            <div class="stat">
              <div class="stat-number">${data.reactionCount}</div>
              <div>Reactions</div>
            </div>
            <div class="stat">
              <div class="stat-number">${data.uniqueVisitors}</div>
              <div>Unique Visitors</div>
            </div>
          </div>

          ${data.newSympathies.length > 0 ? `
          <h3>New Sympathy Messages</h3>
          <div class="sympathy-list">
            ${data.newSympathies.map(sympathy => `
              <div class="sympathy">
                <strong>${sympathy.author}</strong> • ${new Date(sympathy.createdAt).toLocaleDateString()}
                <br>"${sympathy.message}"
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${data.topReactions.length > 0 ? `
          <h3>Popular Reactions</h3>
          <ul>
            ${data.topReactions.map(reaction => `
              <li>${reaction.type}: ${reaction.count} reaction${reaction.count > 1 ? 's' : ''}</li>
            `).join('')}
          </ul>
          ` : ''}

          <p>
            <a href="${data.graveUrl}" class="button">View Memorial</a>
          </p>
        </div>
        <div class="footer">
          <p>You're receiving this daily digest because you have it enabled in your notification preferences.</p>
          <p><a href="${data.graveUrl.replace('/grave/', '/profile')}">Update notification preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
${subject}

Yesterday's Activity Summary:
${activitySummary.join(', ')}

Statistics:
- ${data.sympathyCount} new sympathy messages
- ${data.reactionCount} reactions
- ${data.uniqueVisitors} unique visitors

${data.newSympathies.length > 0 ? `
New Sympathy Messages:
${data.newSympathies.map(s => `• ${s.author}: "${s.message}"`).join('\n')}
` : ''}

${data.topReactions.length > 0 ? `
Popular Reactions:
${data.topReactions.map(r => `• ${r.type}: ${r.count}`).join('\n')}
` : ''}

View the memorial: ${data.graveUrl}

---
You're receiving this daily digest because you have it enabled in your notification preferences.
Update your preferences: ${data.graveUrl.replace('/grave/', '/profile')}
  `;

  return { subject, html, text };
}