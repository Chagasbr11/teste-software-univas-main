import { test, expect } from '@playwright/test';

test.describe('CRUD de Categorias', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/categories');
  });

  test('deve criar uma nova categoria', async ({ page }) => {
    const uniqueCategoryName = `Categoria ${Date.now()}`;
    
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.getByLabel('Nome:').fill(uniqueCategoryName);
    await page.getByRole('button', { name: /Criar/i }).click();

    // Verificar se a categoria aparece na lista
    await expect(page.getByText(uniqueCategoryName)).toBeVisible();
  });

  test('deve atualizar uma categoria existente', async ({ page }) => {
    const originalCategoryName = `Categoria ${Date.now()}`;
    const updatedCategoryName = `${originalCategoryName} Atualizada`;

    // Criar uma categoria primeiro
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.getByLabel('Nome:').fill(originalCategoryName);
    await page.getByRole('button', { name: /Criar/i }).click();

    // Atualizar a categoria
    await page.getByText(originalCategoryName).click();
    await page.getByRole('button', { name: /Editar/i }).click();
    await page.getByLabel('Nome:').fill(updatedCategoryName);
    await page.getByRole('button', { name: /Salvar/i }).click();

    // Verificar se a categoria foi atualizada
    await expect(page.getByText(updatedCategoryName)).toBeVisible();
  });

  test('deve excluir uma categoria', async ({ page }) => {
    const categoryNameToDelete = `Categoria ${Date.now()}`;
    
    // Criar uma categoria primeiro
    await page.getByRole('button', { name: /Adicionar Categoria/i }).click();
    await page.getByLabel('Nome:').fill(categoryNameToDelete);
    await page.getByRole('button', { name: /Criar/i }).click();

    // Excluir a categoria
    await page.getByText(categoryNameToDelete).click();
    await page.getByRole('button', { name: /Excluir/i }).click();
    
    // Verificar se a categoria foi removida
    await expect(page.locator(`text=${categoryNameToDelete}`)).not.toBeVisible();
  });

  test('deve listar todas as categorias', async ({ page }) => {
    // Verificar se a lista de categorias está visível
    await expect(page.locator('ul.categorias-list')).toBeVisible();

    // Verificar se há mais de 0 elementos 'li' visíveis na página
    const categoryCount = await page.locator('li').count();
    expect(categoryCount).toBeGreaterThan(0); // Verificando se o número de categorias é maior que 0
  });

  test('deve manter navegação funcionando após reload', async ({ page }) => {
    await page.getByRole('link', { name: /Categorias/i }).click();
    await page.reload();
    await expect(page).toHaveURL(/.*categories/);
  });
});
