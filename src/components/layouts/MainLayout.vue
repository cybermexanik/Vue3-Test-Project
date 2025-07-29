<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <h2 class="title">Панель</h2>
      <hr class="divider">
      <nav class="navigation">
        <RouterLink to="/sales">Продажи</RouterLink>
        <RouterLink to="/orders">Заказы</RouterLink>
        <RouterLink to="/stocks">Склады</RouterLink>
        <RouterLink to="/incomes">Доходы</RouterLink>
      </nav>
    </aside>
    <main class="main-content">
      <div class="main-inner">
        <v-container fluid>
          <RouterView />
        </v-container>
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.sidebar {
  width: 260px;
  background-color: white;
  color: black;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: black;
}

.divider {
  border: none;
  border-top: 3px solid rgba(66, 185, 131, 0.5);
}

.navigation {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.navigation a {
  display: block;
  padding: 0.85rem 1.25rem;
  border-radius: 8px;
  color: black;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.navigation a:hover {
  background-color: #f2f2f2;
  color: black;
}

.navigation a.router-link-active {
  background-color: rgba(66, 185, 131, 0.5);
  color: black;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
}

.main-inner {
  flex: 1;
  width: 100%;
}
</style>
