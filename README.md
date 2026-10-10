# English Study Journal

This repository hosts a personal English learning blog built as a static website.

## Live site

Open the blog here:

https://sofajohnlee.github.io/blog/

## Deployment setup

To enable GitHub Pages:

1. Go to the repository settings.
2. Open the Pages tab.
3. Set Source to "Deploy from a branch".
4. Select the `main` branch.
5. Set the folder to `/root`.
6. Save.

After a few minutes, the blog will be published at the URL above.

## Blog structure

- `index.html` — main landing page
- `styles.css` — page styling
- `README.md` — repository overview
- `posts/` — article content grouped by topic

## Topics covered

- Daily Expressions
- Grammar
- Pronunciation
- Idioms
- Study Tips

## Notes

This is a simple static blog that is easy to maintain and update with new posts over time.

## Japanese study (October 2026)

English remains the default homepage and English archive. Japanese study is available at `/japanese/`, with three introductory posts on hiragana, katakana, and greetings/self-introductions. Posts use `study_language` to keep language lists and adjacent-post navigation separate. Existing posts default to English through `_config.yml`.

## Cooking recipes

Recipes are listed at `/recipes/`. Recipe posts use `layout: post`, `study_language: cooking`, and `categories: [recipes]`, with their own title, description, date and permalink. English remains the default home and archive; recipe navigation stays within cooking posts.
