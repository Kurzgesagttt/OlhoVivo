import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AppHeader, Button, Card, Field, Notice, PageContainer, PageShell, SelectInput, TextArea, TextInput } from '../components/ui'
import { useCategories } from '../hooks/useCategories'
import { useNeighborhoods } from '../hooks/useNeighborhoods'
import { useCreateOccurrence } from '../hooks/useOccurrences'

export default function CreateOccurrencePage() {
  const navigate = useNavigate()
  const createOccurrence = useCreateOccurrence()
  const { data: categorias = [], isLoading: isLoadingCategorias, isError: isErroCategorias } = useCategories()
  const { data: bairros = [], isLoading: isLoadingBairros, isError: isErroBairros } = useNeighborhoods()
  const [form, setForm] = useState({ titulo: '', descricao: '', categoriaId: '', bairroId: '', endereco: '' })
  const [erro, setErro] = useState('')

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErro('')

    if (form.titulo.trim().length < 5) {
      setErro('Titulo deve ter pelo menos 5 caracteres.')
      return
    }
    if (form.descricao.trim().length < 20) {
      setErro('Descricao deve ter pelo menos 20 caracteres.')
      return
    }

    try {
      const ocorrencia = await createOccurrence.mutateAsync({
        titulo: form.titulo,
        descricao: form.descricao,
        categoriaId: form.categoriaId,
        ...(form.bairroId ? { bairroId: form.bairroId } : {}),
        ...(form.endereco ? { endereco: form.endereco } : {}),
      })
      navigate(`/ocorrencias/${ocorrencia.id}`)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErro(err.response.data.message)
      } else {
        setErro('Erro ao criar ocorrencia. Tente novamente.')
      }
    }
  }

  return (
    <PageShell>
      <AppHeader title="Nova ocorrencia" subtitle="Registre um problema do bairro" backTo="back" />
      <PageContainer className="max-w-2xl">
        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Titulo" hint={`${form.titulo.length}/100 (min. 5)`}>
              <TextInput
                required
                value={form.titulo}
                onChange={event => set('titulo', event.target.value)}
                placeholder="Resumo do problema"
                maxLength={100}
                minLength={5}
              />
            </Field>

            <Field label="Descricao" hint={`${form.descricao.length}/500 (min. 20)`}>
              <TextArea
                required
                value={form.descricao}
                onChange={event => set('descricao', event.target.value)}
                rows={4}
                placeholder="Descreva o problema com detalhes"
                maxLength={500}
                minLength={20}
              />
            </Field>

            <Field label="Categoria">
              <SelectInput
                required
                value={form.categoriaId}
                onChange={event => set('categoriaId', event.target.value)}
                disabled={isLoadingCategorias || isErroCategorias}
              >
                <option value="">{isLoadingCategorias ? 'Carregando categorias...' : 'Selecione uma categoria'}</option>
                {categorias.map(categoria => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}
              </SelectInput>
              {isErroCategorias && <p className="mt-1 text-sm text-red-600 dark:text-red-300">Nao foi possivel carregar as categorias.</p>}
            </Field>

            <Field label="Bairro">
              <SelectInput
                value={form.bairroId}
                onChange={event => set('bairroId', event.target.value)}
                disabled={isLoadingBairros || isErroBairros}
              >
                <option value="">{isLoadingBairros ? 'Carregando bairros...' : 'Selecione um bairro'}</option>
                {bairros.map(bairro => <option key={bairro.id} value={bairro.id}>{bairro.nome}</option>)}
              </SelectInput>
              {isErroBairros && <p className="mt-1 text-sm text-red-600 dark:text-red-300">Nao foi possivel carregar os bairros.</p>}
            </Field>

            <Field label="Endereco" hint="Opcional">
              <TextInput value={form.endereco} onChange={event => set('endereco', event.target.value)} placeholder="Rua, numero, bairro" />
            </Field>

            {erro && <Notice tone="danger">{erro}</Notice>}

            <Button type="submit" variant="primary" disabled={createOccurrence.isPending} className="w-full">
              {createOccurrence.isPending ? 'Enviando...' : 'Registrar ocorrencia'}
            </Button>
          </form>
        </Card>
      </PageContainer>
    </PageShell>
  )
}
