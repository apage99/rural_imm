import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createDestination,
  deleteDestination,
  listDestinations,
  updateDestination,
} from '../../api/destinations'

export function useDestinations() {
  const latestLoadRequestRef = useRef(0)
  const [filters, setFilters] = useState({ page: 1, perPage: 4, search: '' })
  const [destinations, setDestinations] = useState([])
  const [meta, setMeta] = useState({ page: 1, perPage: 4, totalItems: 0, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingDestinationId, setDeletingDestinationId] = useState(null)
  const [error, setError] = useState(null)
  const [serverErrors, setServerErrors] = useState({})
  const [deleteErrors, setDeleteErrors] = useState({})

  const loadDestinations = useCallback(async (nextFilters) => {
    const requestId = latestLoadRequestRef.current + 1
    latestLoadRequestRef.current = requestId

    setIsLoading(true)
    setError(null)

    try {
      const response = await listDestinations(nextFilters)

      if (requestId !== latestLoadRequestRef.current) {
        return
      }

      setDestinations(response.items)
      setMeta(response.meta)
    } catch (requestError) {
      if (requestId !== latestLoadRequestRef.current) {
        return
      }

      setError(requestError.response?.data?.message ?? 'Unable to load destinations.')
    } finally {
      if (requestId === latestLoadRequestRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    let isCancelled = false

    Promise.resolve().then(() => {
      if (!isCancelled) {
        void loadDestinations(filters)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [filters, loadDestinations])

  const applySearch = (search) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      page: 1,
      search,
    }))
  }

  const changePage = (page) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      page,
    }))
  }

  const changePerPage = (perPage) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      page: 1,
      perPage,
    }))
  }

  const saveDestination = async (values, destinationId) => {
    setIsSaving(true)
    setServerErrors({})

    try {
      if (destinationId) {
        await updateDestination(destinationId, values)
      } else {
        await createDestination(values)
      }

      await loadDestinations(destinationId ? filters : { ...filters, page: 1 })

      if (!destinationId) {
        setFilters((currentFilters) => ({
          ...currentFilters,
          page: 1,
        }))
      }

      return true
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? 'Unable to save destination.')
      setServerErrors(requestError.response?.data?.errors ?? {})
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const removeDestination = async (destinationId) => {
    setError(null)
    setDeletingDestinationId(destinationId)
    setDeleteErrors((currentErrors) => ({
      ...currentErrors,
      [destinationId]: undefined,
    }))

    try {
      await deleteDestination(destinationId)

      const nextPage = destinations.length === 1 && meta.page > 1 ? meta.page - 1 : meta.page
      const nextFilters = { ...filters, page: nextPage }

      if (nextPage !== filters.page) {
        setFilters(nextFilters)
      } else {
        await loadDestinations(nextFilters)
      }

      return true
    } catch (requestError) {
      setDeleteErrors((currentErrors) => ({
        ...currentErrors,
        [destinationId]:
          requestError.response?.data?.message ?? 'Unable to delete destination.',
      }))
      return false
    } finally {
      setDeletingDestinationId(null)
    }
  }

  const clearServerErrors = () => {
    setServerErrors({})
  }

  const clearDeleteError = (destinationId) => {
    setDeleteErrors((currentErrors) => ({
      ...currentErrors,
      [destinationId]: undefined,
    }))
  }

  return {
    applySearch,
    changePage,
    changePerPage,
    clearDeleteError,
    clearServerErrors,
    deleteErrors,
    deletingDestinationId,
    destinations,
    error,
    filters,
    isLoading,
    isSaving,
    meta,
    removeDestination,
    saveDestination,
    serverErrors,
  }
}