require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs"); 
const Article = require("./models/Article"); 

const app = express();

app.use(cors());
app.use(express.json());

const frontendDistPath = path.join(__dirname,"..", "..", "AI_News_frontend", "dist");


    console.log("--- PATH DEBUG ---");
console.log("Looking for assets at:", path.join(frontendDistPath, "assets"));
console.log("Assets folder exists?", fs.existsSync(path.join(frontendDistPath, "assets")));
  app.use('/assets', express.static(path.join(frontendDistPath, 'assets'), {
    fallthrough: false // If it's not in /assets, don't let it hit the SEO route
}));
   app.use(express.static(frontendDistPath, { index: false }));


// Routes
const articleRoutes = require("./routes/article.routes");
const settingsRoutes = require("./routes/settings.routes");
const { generalLimiter } = require("./middleware/rateLimit");

// 1. API ROUTES 
app.use("/api/articles", articleRoutes);
app.use("/api/categories", require("./routes/category.routes.js"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/profile", require("./routes/profile.routes"));
app.use("/api/schedules", require("./routes/schedule.routes"));
app.use("/api/settings", settingsRoutes);
app.use("/api/site-branding", require("./routes/asset.routes"));

app.use(generalLimiter);

// 2. THE SEO HANDLER 
// This intercepts the browser when someone visits an article link

app.get('/article/:slug', async (req, res) => {

    console.log(" Incoming SEO Request for:", req.params.slug);
    try {
        const { slug } = req.params;
        const article = await Article.findOne({ slug });

        if (!article) {
            console.log(" Article NOT FOUND in DB for slug:", slug);
            // This is likely why you aren't seeing the injected tags
        } else {
            console.log(" Article FOUND:", article.title);
        }

        // Path to your frontend dist
        const indexPath = path.join(frontendDistPath, 'index.html');
        console.log(" Searching for HTML at:", indexPath);
        
        // If the file doesn't exist (you haven't run npm run build), skip to next
        if (!fs.existsSync(indexPath)) return res.send("Please run npm run build in frontend");

        let htmlData = fs.readFileSync(indexPath, 'utf8');

        if (article) {
            // Use the BASE_URL from your .env file
            const baseUrl = process.env.BASE_URL;
            
            // Generate absolute URLs for the bots
            const seoImageUrl = `${baseUrl}/api/articles/image-proxy/${article.slug}/${article.slug}.jpg`;
            const pageUrl = `${baseUrl}/article/${article.slug}`;

            htmlData = htmlData
                .replace(/__META_TITLE__/g, article.title)
                .replace(/__META_DESCRIPTION__/g, article.summary )
                .replace(/__META_KEYWORDS__/g,  (article.seoKeywords && article.seoKeywords.length > 0) 
                                                ? article.seoKeywords.join(', ') 
                                                : "AI, Adobe, Video Creation, Tech News" // Default keywords
                                            )
                .replace(/__META_IMAGE__/g, seoImageUrl)
                .replace(/__META_URL__/g, pageUrl);

            return res.send(htmlData);
        }

        res.sendFile(indexPath);
    } catch (err) {
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    }
});

// --- THE CATCH-ALL (Final Version for Express 5) ---

    app.use((req, res, next) => {
        // 1. If the request is for an API or a real file in /assets, don't interfere
        if (req.path.startsWith('/api') || req.path.startsWith('/assets')) {
            return next();
        }
        
        // 2. Otherwise, send the React app
        const indexPath = path.join(frontendDistPath, 'index.html');
        res.sendFile(indexPath);
    });


module.exports = app;