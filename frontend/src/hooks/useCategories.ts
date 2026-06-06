import { useQuery } from '@tanstack/react-query'
import { categoryService } from '../services/category.service'

export function useCategories() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: categoryService.listar,
  })
}
