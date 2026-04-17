import { useState } from 'react'
import { useDestinations } from './useDestinations'

const emptyForm = {
  name: '',
  region: '',
  hostCommunity: '',
  description: '',
}

function validateDestination(values) {
  const errors = {}

  if (!values.name.trim()) {
    errors.name = 'Destination name is required.'
  }

  if (!values.region.trim()) {
    errors.region = 'Region is required.'
  }

  if (!values.hostCommunity.trim()) {
    errors.hostCommunity = 'Host community is required.'
  }

  if (!values.description.trim() || values.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters.'
  }

  return errors
}

export default function DestinationsPage() {
  const {
    applySearch,
    changePage,
    changePerPage,
    clearServerErrors,
    destinations,
    error,
    filters,
    isLoading,
    isSaving,
    meta,
    removeDestination,
    saveDestination,
    serverErrors,
  } = useDestinations()
  const [searchDraft, setSearchDraft] = useState('')
  const [formValues, setFormValues] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [editingId, setEditingId] = useState(null)

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    applySearch(searchDraft.trim())
  }

  const handleFieldChange = (event) => {
    const { name, value } = event.target

    clearServerErrors()
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))
    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined,
    }))
  }

  const handleEdit = (destination) => {
    setEditingId(destination.id)
    setFormErrors({})
    clearServerErrors()
    setFormValues({
      name: destination.name,
      region: destination.region,
      hostCommunity: destination.hostCommunity,
      description: destination.description,
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setFormValues(emptyForm)
    setFormErrors({})
    clearServerErrors()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validateDestination(formValues)

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors)
      return
    }

    const didSave = await saveDestination(
      {
        name: formValues.name.trim(),
        region: formValues.region.trim(),
        hostCommunity: formValues.hostCommunity.trim(),
        description: formValues.description.trim(),
      },
      editingId,
    )

    if (didSave) {
      resetForm()
    }
  }

  return (
    <section className="dashboard-grid">
      <div className="content-panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Destinations</p>
            <h2>Manage rural immersion inventory.</h2>
          </div>

          <form className="toolbar" onSubmit={handleSearchSubmit}>
            <input
              aria-label="Search destinations"
              className="search-input"
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Search by destination name"
              value={searchDraft}
            />

            <select
              aria-label="Results per page"
              className="page-select"
              onChange={(event) => changePerPage(Number(event.target.value))}
              value={filters.perPage}
            >
              <option value={4}>4 / page</option>
              <option value={6}>6 / page</option>
              <option value={8}>8 / page</option>
            </select>

            <button className="primary-button" type="submit">
              Search
            </button>
          </form>
        </div>

        {error ? <p className="error-message">{error}</p> : null}

        {isLoading ? (
          <div className="empty-state">Loading destinations...</div>
        ) : destinations.length === 0 ? (
          <div className="empty-state">No destinations matched the current filter.</div>
        ) : (
          <div className="card-grid">
            {destinations.map((destination) => (
              <article className="destination-card" key={destination.id}>
                <div className="destination-copy">
                  <p className="eyebrow">{destination.region}</p>
                  <h3>{destination.name}</h3>
                  <p className="host-community">Host community: {destination.hostCommunity}</p>
                  <p>{destination.description}</p>
                </div>

                <div className="card-actions">
                  <button
                    className="ghost-button"
                    onClick={() => handleEdit(destination)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="ghost-button danger"
                    onClick={() => removeDestination(destination.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="pagination-bar">
          <p>
            Page {meta.page} of {meta.totalPages} · {meta.totalItems} destinations
          </p>

          <div className="pagination-actions">
            <button
              className="ghost-button"
              disabled={meta.page <= 1}
              onClick={() => changePage(meta.page - 1)}
              type="button"
            >
              Previous
            </button>
            <button
              className="ghost-button"
              disabled={meta.page >= meta.totalPages}
              onClick={() => changePage(meta.page + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <aside className="content-panel form-panel">
        <div className="section-header compact">
          <div>
            <p className="eyebrow">{editingId ? 'Edit destination' : 'Add destination'}</p>
            <h2>{editingId ? 'Update destination details.' : 'Create a new destination.'}</h2>
          </div>

          {editingId ? (
            <button className="ghost-button" onClick={resetForm} type="button">
              Cancel edit
            </button>
          ) : null}
        </div>

        <form className="destination-form" noValidate onSubmit={handleSubmit}>
          <label className="field-group" htmlFor="destination-name">
            <span>Name</span>
            <input id="destination-name" name="name" onChange={handleFieldChange} value={formValues.name} />
            {formErrors.name || serverErrors.name ? (
              <span className="error-message">{formErrors.name ?? serverErrors.name}</span>
            ) : null}
          </label>

          <label className="field-group" htmlFor="destination-region">
            <span>Region</span>
            <input id="destination-region" name="region" onChange={handleFieldChange} value={formValues.region} />
            {formErrors.region || serverErrors.region ? (
              <span className="error-message">{formErrors.region ?? serverErrors.region}</span>
            ) : null}
          </label>

          <label className="field-group" htmlFor="destination-host-community">
            <span>Host community</span>
            <input
              id="destination-host-community"
              name="hostCommunity"
              onChange={handleFieldChange}
              value={formValues.hostCommunity}
            />
            {formErrors.hostCommunity || serverErrors.hostCommunity ? (
              <span className="error-message">
                {formErrors.hostCommunity ?? serverErrors.hostCommunity}
              </span>
            ) : null}
          </label>

          <label className="field-group" htmlFor="destination-description">
            <span>Description</span>
            <textarea
              id="destination-description"
              name="description"
              onChange={handleFieldChange}
              rows={5}
              value={formValues.description}
            />
            {formErrors.description || serverErrors.description ? (
              <span className="error-message">
                {formErrors.description ?? serverErrors.description}
              </span>
            ) : null}
          </label>

          <button className="primary-button" disabled={isSaving} type="submit">
            {isSaving ? 'Saving...' : editingId ? 'Update destination' : 'Create destination'}
          </button>
        </form>
      </aside>
    </section>
  )
}