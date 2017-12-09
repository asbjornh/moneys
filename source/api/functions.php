<?php
  function get($collection, $key, $default = null) {
    if (is_null($key)) {
      return $collection;
    }

    $collection = (array) $collection;

    if (isset($collection[$key])) {
      return $collection[$key];
    }

    // Crawl through collection, get key according to object or not
    foreach (explode('.', $key) as $segment) {
      $collection = (array) $collection;
      if (!isset($collection[$segment])) {
        return $default instanceof Closure ? $default() : $default;
      }
      $collection = $collection[$segment];
    }
    return $collection;
  }
?>