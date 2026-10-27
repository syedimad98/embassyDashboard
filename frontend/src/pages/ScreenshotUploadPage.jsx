
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ImagePlus, Upload, X } from 'lucide-react'
import '../App.css'

const sampleScreenshots = [
  { title: 'Campaign overview', label: 'Social campaign', accent: 'blue' },
  { title: 'Audience delivery', label: 'Video report', accent: 'violet' },
  { title: 'Performance summary', label: 'Display campaign', accent: 'teal' },
]

function randomItems(items, count) {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count)
}

function SampleScreenshot({ screenshot }) {
  return (
    <article
      className={`screenshot-preview screenshot-preview-${screenshot.accent}`}
      aria-label={`${screenshot.title} sample screenshot`}
    >
      <div className="screenshot-preview-top">
        <span className="screenshot-preview-mark" />
        <span />
        <span />
      </div>

      <div className="screenshot-preview-content">
        <span className="screenshot-preview-kicker">
          {screenshot.label}
        </span>
        <strong>{screenshot.title}</strong>

        <div className="screenshot-preview-metrics">
          <span><b>1.2M</b><small>Impressions</small></span>
          <span><b>4.8%</b><small>Engagement</small></span>
        </div>

        <div className="screenshot-preview-chart">
          <i /><i /><i /><i /><i /><i /><i />
        </div>
      </div>
    </article>
  )
}

export default function ScreenshotUploadPage() {
  const [previews, setPreviews] = useState([])
  const [uploadedScreenshots, setUploadedScreenshots] = useState([])
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [screenshotToDelete, setScreenshotToDelete] = useState(null)
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [sampleGallery] = useState(() => randomItems(sampleScreenshots, 3))
  const previewsRef = useRef([])

  const dashboardPath =
    window.location.pathname.replace(/\/upload-images\/?$/, '/') || '/'

  useEffect(() => {
    return () => {
      previewsRef.current.forEach(({ url }) => URL.revokeObjectURL(url))
    }
  }, [])

  async function fetchScreenshots() {
    try {
      const response = await fetch('/api/screenshots')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch screenshots.')
      }

      setUploadedScreenshots(result.screenshots || [])
      return true
    } catch (error) {
      setMessage(error.message || 'Could not load uploaded screenshots.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchScreenshots()
  }, [])

  function processFiles(files) {
    const acceptedFiles = files.filter((file) =>
      ['image/jpeg', 'image/png'].includes(file.type),
    )

    previewsRef.current.forEach(({ url }) => URL.revokeObjectURL(url))

    const nextPreviews = acceptedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))

    previewsRef.current = nextPreviews
    setPreviews(nextPreviews)

    if (acceptedFiles.length !== files.length) {
      setMessage('Only JPG and PNG images are allowed. Other files were skipped.')
    } else {
      setMessage('')
    }
  }

  function handleFilesChanged(event) {
    processFiles(Array.from(event.target.files || []))
    event.target.value = ''
  }

  function removePreview(url) {
    URL.revokeObjectURL(url)

    const nextPreviews = previewsRef.current.filter(
      (preview) => preview.url !== url,
    )

    previewsRef.current = nextPreviews
    setPreviews(nextPreviews)
  }

  async function handleUpload() {
    if (previews.length === 0 || isUploading) return

    // Validate file size before sending the request.
    const oversizedFile = previews.find(
      ({ file }) => file.size > 5 * 1024 * 1024,
    )

    if (oversizedFile) {
      setMessage(`${oversizedFile.file.name} exceeds the 5 MB file limit.`)
      return
    }

    setIsUploading(true)
    setMessage('')

    try {
      const formData = new FormData()

      previews.forEach(({ file }) => {
        formData.append('screenshots', file)
      })

      const response = await fetch('/api/screenshots', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Screenshot upload failed.')
      }

      // Fetch the saved images from the GET endpoint.
      const refreshed = await fetchScreenshots()

      if (!refreshed) {
        throw new Error(
          'Images were uploaded, but the gallery could not be refreshed.',
        )
      }

      previewsRef.current.forEach(({ url }) => URL.revokeObjectURL(url))
      previewsRef.current = []
      setPreviews([])

      setMessage(
        `${result.uploadedCount} screenshot(s) uploaded successfully.`,
      )
    } catch (error) {
      setMessage(error.message || 'Could not upload screenshots.')
    } finally {
      setIsUploading(false)
    }
  }

  function openDeleteModal(screenshot) {
  setScreenshotToDelete(screenshot)
  setIsDeleteModalOpen(true)
  setMessage('')
}

function closeDeleteModal() {
  if (deletingId) return

  setIsDeleteModalOpen(false)
  setScreenshotToDelete(null)
}

async function confirmDeleteScreenshot() {
  if (!screenshotToDelete || deletingId) return

  const screenshot = screenshotToDelete
  setDeletingId(screenshot.id)
  setMessage('')

  try {
    const response = await fetch(
      `/api/screenshots/${encodeURIComponent(screenshot.id)}`,
      { method: 'DELETE' },
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete screenshot.')
    }

    // Remove the deleted screenshot from the UI immediately.
    setUploadedScreenshots((current) =>
      current.filter((item) => item.id !== screenshot.id),
    )

    setIsDeleteModalOpen(false)
    setScreenshotToDelete(null)
    setMessage('Screenshot deleted successfully.')
  } catch (error) {
    setMessage(error.message || 'Could not delete screenshot.')
  } finally {
    setDeletingId(null)
  }
}

  return (
    <main className="screenshot-upload-page">
      <header className="screenshot-page-heading">
        <a className="screenshot-back-link" href={dashboardPath}>
          <ArrowLeft size={18} aria-hidden="true" /> Dashboard
        </a>

        <p className="eyebrow">CAMPAIGN ASSETS</p>
        <h1>Upload Images</h1>
        <p className="page-description">
          Upload campaign screenshots and view your saved images.
        </p>
      </header>

      <div className="screenshot-card-grid">
        <section
          className="screenshot-card"
          aria-labelledby="screenshot-upload-heading"
        >
          <div className="screenshot-card-heading">
            <span className="screenshot-card-icon">
              <ImagePlus size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 id="screenshot-upload-heading">Upload files</h2>
              <p>Select screenshots from your device.</p>
            </div>
          </div>

          <label
            className="screenshot-dropzone"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              processFiles(Array.from(event.dataTransfer.files))
            }}
          >
            <input
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleFilesChanged}
            />

            <span className="screenshot-upload-icon">
              <Upload size={22} aria-hidden="true" />
            </span>
            <strong>Choose image files</strong>
            <span>or drag and drop them here</span>
            <small>JPG and PNG only. Maximum 5 MB per image.</small>
          </label>

          {message && (
            <p className="screenshot-upload-message" role="status">
              {message}
            </p>
          )}

          {previews.length > 0 && (
            <div className="selected-image-list" aria-live="polite">
              <strong>
                {previews.length} image{previews.length === 1 ? '' : 's'} selected
              </strong>

              <ul>
                {previews.map(({ file, url }) => (
                  <li key={`${file.name}-${file.lastModified}-${url}`}>
                    <img src={url} alt="" />
                    <span>{file.name}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => removePreview(url)}
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="screenshot-submit-button"
                onClick={handleUpload}
                disabled={isUploading}
              >
                <Upload size={17} aria-hidden="true" />
                {isUploading ? 'Uploading...' : 'Upload screenshots'}
              </button>
            </div>
          )}
        </section>

        <section
          className="screenshot-card"
          aria-labelledby="recent-screenshots-heading"
        >
          <div className="screenshot-card-heading">
            <span className="screenshot-card-icon">
              <ImagePlus size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 id="recent-screenshots-heading">
                Selected screenshots
              </h2>
              <p>
                Images retrieved from the server.
              </p>
            </div>
          </div>

          {isLoading ? (
            <p>Loading uploaded screenshots...</p>
          ) : uploadedScreenshots.length > 0 ? (
            <div className="uploaded-screenshot-gallery">
             {uploadedScreenshots.map((screenshot) => (
  <figure
    className="uploaded-screenshot"
    key={screenshot.id}
  >
    <img
      src={screenshot.imageUrl}
      alt={screenshot.filename}
    />

    <figcaption>{screenshot.filename}</figcaption>

   <button
  type="button"
  className="delete-screenshot-button"
  onClick={() => openDeleteModal(screenshot)}
  disabled={deletingId !== null}
  aria-label={`Delete ${screenshot.filename}`}
>
  Delete
</button>
  </figure>
))}
            </div>
          ) : (
            <div className="uploaded-screenshot-gallery sample-screenshot-gallery">
              {sampleGallery.map((screenshot) => (
                <SampleScreenshot
                  key={screenshot.title}
                  screenshot={screenshot}
                />
              ))}
            </div>
          )}
        </section>
      </div>
      {isDeleteModalOpen && screenshotToDelete && (
  <div
    className="delete-modal-overlay"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) {
        closeDeleteModal()
      }
    }}
  >
    <section
      className="delete-modal"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-description"
    >
      <div className="delete-modal-icon">
        <X size={26} aria-hidden="true" />
      </div>

      <h2 id="delete-modal-title">Delete this image?</h2>

      <p id="delete-modal-description">
        Are you sure you want to delete this screenshot? This action
        cannot be undone.
      </p>

      <div className="delete-modal-filename">
        {screenshotToDelete.filename}
      </div>

      <div className="delete-modal-actions">
        <button
          type="button"
          className="delete-modal-cancel"
          onClick={closeDeleteModal}
          disabled={deletingId !== null}
        >
          Cancel
        </button>

        <button
          type="button"
          className="delete-modal-confirm"
          onClick={confirmDeleteScreenshot}
          disabled={deletingId !== null}
        >
          {deletingId !== null ? 'Deleting...' : 'Delete image'}
        </button>
      </div>
    </section>
  </div>
)}
    </main>
  )
}
