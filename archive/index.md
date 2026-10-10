---
layout: default
title: "전체 학습 기록"
description: "2024년 7월부터 이어 온 English Study Journal의 전체 글 목록"
permalink: /archive/
---

<div class="section-heading">
  <span class="eyebrow">Archive</span>
  <h1>2024년 7월부터 이어 온 영어 공부 기록</h1>
  <p class="page-intro">처음 공부를 시작한 기록부터 최근의 듣기·말하기 연습까지 시간순으로 다시 볼 수 있습니다.</p>
</div>

{% assign posts_by_year = site.posts | group_by_exp: "post", "post.date | date: '%Y'" %}
{% for year in posts_by_year %}
  <section class="category-section">
    <h2>{{ year.name }}</h2>
    <div class="post-list">
      {% for post in year.items %}
        <article class="post-item">
          <span class="post-tag">{{ post.date | date: "%Y.%m.%d" }}</span>
          <h3>{{ post.title }}</h3>
          <p>{{ post.description }}</p>
          <a href="{{ post.url | relative_url }}?v={{ site.time | date: '%s' }}">읽어보기 →</a>
        </article>
      {% endfor %}
    </div>
  </section>
{% endfor %}
