---
layout: default
title: "카테고리"
description: "English Study Journal의 영어 학습 카테고리"
permalink: /categories/
study_language: english
---
<div class="section-heading">
  <span class="eyebrow">Categories</span>
  <h1>주제별 영어 학습</h1>
  <p class="page-intro">회화, 문법, 발음, 숙어, 학습법을 주제별로 정리했습니다.</p>
</div>

{% assign category_names = "daily-expressions,grammar,pronunciation,idioms,study-tips" | split: "," %}
{% assign category_labels = "Daily Expressions,Grammar,Pronunciation,Idioms,Study Tips" | split: "," %}

{% for category in category_names %}
  {% assign label = category_labels[forloop.index0] %}
  <section class="category-section" id="{{ category }}">
    <h2>{{ label }}</h2>
    <div class="post-list">
      {% for post in site.posts %}
        {% if post.categories contains category %}
          <article class="post-item">
            <span class="post-tag">{{ label }}</span>
            <h3>{{ post.title }}</h3>
            <p>{{ post.description }}</p>
            <a href="{{ post.url | relative_url }}?v={{ site.time | date: '%s' }}">읽어보기 →</a>
          </article>
        {% endif %}
      {% endfor %}
    </div>
  </section>
{% endfor %}
