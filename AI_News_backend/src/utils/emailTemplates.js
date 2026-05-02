export const generateDigestHTML = (name, articles) => {
  const greetingName = name || 'Reader';
  const articleRows = articles.map(art => `
    <div style="padding: 20px 0; border-bottom: 1px solid #eee;">
      ${art.bannerImage ? `
        <div style="margin-bottom: 15px;">
          <img src="${art.bannerImage}" alt="${art.title}" style="width: 100%; max-height: 250px; object-fit: cover; border-radius: 4px; display: block;" />
        </div>
      ` : ''}
      
      <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #0055ff; letter-spacing: 1px;">
        ${art.category || 'General'}
      </span>
      
      <h3 style="margin: 8px 0; color: #111; font-size: 20px; line-height: 1.3;">
        ${art.title}
      </h3>
      
      <p style="font-size: 15px; color: #444; line-height: 1.6; margin-bottom: 15px;">
        ${art.summary}
      </p>
      
      <a href="https://verbis-ai.com/article/${art.slug}" style="font-size: 12px; color: #111; font-weight: 800; text-decoration: none; border-bottom: 2px solid #0055ff; padding-bottom: 2px;">
        READ FULL STORY →
      </a>
    </div>
  `).join('');

  return `
    <div style="max-width: 600px; margin: auto; font-family: 'Georgia', serif; color: #111; background-color: #ffffff; padding: 20px;">
      <div style="text-align: center; border-bottom: 3px double #111; padding-bottom: 15px; margin-bottom: 25px;">
        <h1 style="font-style: italic; font-weight: 900; margin: 0; font-size: 36px; color: #111;">Verbis AI</h1>
        <p style="font-size: 10px; letter-spacing: 3px; text-transform: uppercase; margin: 8px 0; color: #666;">The Daily Intelligence Briefing</p>
      </div>
      
      <p style="font-size: 16px; margin-bottom: 30px;">Good morning, <strong>$${greetingName}</strong>. Here is your curated briefing for today.</p>
      
      ${articleRows}
      
      <div style="margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px;">
        <p style="margin-bottom: 10px;">You are receiving this because you subscribed to the Verbis AI reader network.</p>
        <div style="text-transform: uppercase; letter-spacing: 1px;">
          <a href="https://verbis-ai.com/profile" style="color: #0055ff; text-decoration: none;">Manage Account</a> 
          <span style="margin: 0 10px;">|</span>
          <a href="https://verbis-ai.com/unsubscribe" style="color: #999; text-decoration: none;">Unsubscribe</a>
        </div>
      </div>
    </div>
  `;
};