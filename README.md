# Sublime-Carousel

## Features
Supports multiple carousels per page. If there's only 1 on the page, r/l arrow keys will emulate prev/next.

## Usage
Container gets class "sublime-carousel". Each item to display gets class "carousel-item". Transition speed defaults to 500ms; set ```data-speed``` on the container to customize. Example:

```html
<div class="sublime-carousel" speed="800">
  <div class="carousel-item">Item 0</div>
  <div class="carousel-item">Item 1</div>
  <div class="carousel-item">Item 2</div>
</div>
```
