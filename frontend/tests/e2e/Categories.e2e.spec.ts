import { test, expect } from '@playwright/test';

test.describe('Categorias', () => {

    test('navega para Categorias e lista itens do backend', async ({ page }) => {
        await page.goto('/') // Dashboard
        await page.getByRole('link', { name: 'Categorias' }).click()

        // Espera até que o texto "Tecnologia" esteja visível na página
        await page.waitForSelector('text=Tecnologia', { timeout: 20000 });
        await expect(page.getByText(/Tecnologia/i)).toBeVisible()

        // Espera até que o texto "Saúde" esteja visível na página
        await page.waitForSelector('text=Saúde', { timeout: 20000 });
        await expect(page.getByText(/Saúde/i)).toBeVisible()
    })

    test('cria categoria e aparece na lista', async ({ page }) => {
        await page.goto('/categories')

        await page.getByRole('button', { name: /Adicionar Categoria/i }).click()

        const uniqueCategoryName = `Categoria ${Date.now()}`

        // Espera que o campo de entrada esteja disponível e preenche
        await page.waitForSelector('input[placeholder="Nome da Categoria"]', { timeout: 20000 });
        await page.fill('input[placeholder="Nome da Categoria"]', uniqueCategoryName)

        // Clica no botão "Criar"
        await page.getByRole('button', { name: /Criar/i }).click()

        // Espera que a categoria apareça na lista
        await page.waitForSelector(`text=${uniqueCategoryName}`, { timeout: 20000 });
        await expect(page.getByText(uniqueCategoryName)).toBeVisible()
    })

    test('atualiza categoria existente e exibe dados atualizados', async ({ page }) => {
        await page.goto('/categories')

        const originalCategoryName = `Categoria Edit ${Date.now()}`
        const updatedCategoryName = `Categoria Edit ${Date.now()}. Atualizada`

        // Cria a categoria
        await page.getByRole('button', { name: /Adicionar Categoria/i }).click()
        await page.waitForSelector('input[placeholder="Nome da Categoria"]', { timeout: 20000 });
        await page.fill('input[placeholder="Nome da Categoria"]', originalCategoryName)
        await page.getByRole('button', { name: /Criar/i }).click()

        await page.waitForSelector(`text=${originalCategoryName}`, { timeout: 20000 });
        await expect(page.getByText(originalCategoryName)).toBeVisible()

        // Localiza a linha da categoria recém-criada
        const row = page.locator(`text=${originalCategoryName}`).first()
        await row.locator('button:has-text("Editar")').click()

        // Atualiza o nome da categoria
        await page.fill('input[placeholder="Nome da Categoria"]', updatedCategoryName)
        await page.getByRole('button', { name: /Salvar|Atualizar/i }).click()

        // Espera o nome atualizado aparecer
        await page.waitForSelector(`text=${updatedCategoryName}`, { timeout: 20000 });
        await expect(page.getByText(updatedCategoryName)).toBeVisible()

        // Verifica que o nome antigo não aparece mais
        await expect(page.getByText(originalCategoryName)).not.toBeVisible()
    })

    test('exclui categoria e remove da lista', async ({ page }) => {
        await page.goto('/categories')

        const categoryToDelete = `Categoria Delete ${Date.now()}`

        // Cria a categoria para testar a exclusão
        await page.getByRole('button', { name: /Adicionar Categoria/i }).click()
        await page.waitForSelector('input[placeholder="Nome da Categoria"]', { timeout: 20000 });
        await page.fill('input[placeholder="Nome da Categoria"]', categoryToDelete)
        await page.getByRole('button', { name: /Criar/i }).click()

        await page.waitForSelector(`text=${categoryToDelete}`, { timeout: 20000 });
        await expect(page.getByText(categoryToDelete)).toBeVisible()

        // Localiza a linha dessa categoria
        const row = page.locator(`text=${categoryToDelete}`).first()
        await row.locator('button:has-text("Excluir")').click()

        // Aguarda o modal e confirma a exclusão
        await page.locator('button:has-text("Confirmar")').click()

        await page.waitForSelector(`text=${categoryToDelete}`, { state: 'hidden', timeout: 20000 });
        await expect(page.getByText(categoryToDelete)).not.toBeVisible()
    })

})
