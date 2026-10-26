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
    <article className={`screenshot-preview screenshot-preview-${screenshot.accent}`} aria-label={`${screenshot.title} sample screenshot`}>
      <div className="screenshot-preview-top">
        <span className="screenshot-preview-mark" />
        <span />
        <span />
      </div>
      <div className="screenshot-preview-content">
        <span className="screenshot-preview-kicker">{screenshot.label}</span>
        <strong>{screenshot.title}</strong>
        <div className="screenshot-preview-metrics">
          <span><b>1.2M</b><small>Impressions</small></span>
          <span><b>4.8%</b><small>Engagement</small></span>
        </div>
        <div className="screenshot-preview-chart"><i /><i /><i /><i /><i /><i /><i /></div>
      </div>
    </article>
  )
}

export default function ScreenshotUploadPage() {
  const [previews, setPreviews] = useState([])
  const [message, setMessage] = useState('')
  const [sampleGallery] = useState(() => randomItems(sampleScreenshots, 3))
  const previewsRef = useRef([])
  const dashboardPath = window.location.pathname.replace(/\/upload-images\/?$/, '/') || '/'

  useEffect(() => () => {
    previewsRef.current.forEach((preview) => URL.revokeObjectURL(preview.url))
  }, [])

  function processFiles(files) {
    const acceptedFiles = files.filter((file) => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type))
    previewsRef.current.forEach((preview) => URL.revokeObjectURL(preview.url))

    const nextPreviews = acceptedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
    previewsRef.current = nextPreviews
    setPreviews(nextPreviews)
    setMessage(acceptedFiles.length === files.length
      ? ''
      : 'Only JPG, PNG, GIF, and WEBP image files are allowed. Other files were skipped.')
  }

  function handleFilesChanged(event) {
    processFiles(Array.from(event.target.files || []))
    event.target.value = ''
  }

  return (
    <main className="screenshot-upload-page">
      <header className="screenshot-page-heading">
        <a className="screenshot-back-link" href={dashboardPath}><ArrowLeft size={18} aria-hidden="true" /> Dashboard</a>
        <p className="eyebrow">CAMPAIGN ASSETS</p>
        <h1>Upload screenshots</h1>
        <p className="page-description">Upload image files and preview recent campaign screenshots.</p>
      </header>

      <div className="screenshot-card-grid">
        <section className="screenshot-card" aria-labelledby="screenshot-upload-heading">
          <div className="screenshot-card-heading">
            <span className="screenshot-card-icon"><ImagePlus size={20} aria-hidden="true" /></span>
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
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handleFilesChanged}
            />
            <span className="screenshot-upload-icon"><Upload size={22} aria-hidden="true" /></span>
            <strong>Choose image files</strong>
            <span>or drag and drop them here</span>
            <small>Image formats only: JPG, PNG, GIF, WEBP</small>
          </label>
          {message && <p className="screenshot-upload-message" role="alert">{message}</p>}
          {previews.length > 0 && (
            <div className="selected-image-list" aria-live="polite">
              <strong>{previews.length} image{previews.length === 1 ? '' : 's'} selected</strong>
              <ul>
                {previews.map(({ file, url }) => (
                  <li key={`${file.name}-${file.lastModified}`}>
                    <img src={url} alt="" />
                    <span>{file.name}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => {
                        URL.revokeObjectURL(url)
                        const nextPreviews = previews.filter((preview) => preview.url !== url)
                        previewsRef.current = nextPreviews
                        setPreviews(nextPreviews)
                      }}
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="screenshot-card" aria-labelledby="recent-screenshots-heading">
          <div className="screenshot-card-heading">
            <span className="screenshot-card-icon"><ImagePlus size={20} aria-hidden="true" /></span>
            <div>
              <h2 id="recent-screenshots-heading">{previews.length ? 'Selected screenshots' : 'Recent screenshots'}</h2>
              <p>{previews.length ? 'Preview of your selected image files.' : 'A few examples of uploaded campaign screenshots.'}</p>
            </div>
          </div>
          {previews.length ? (
            <div className="uploaded-screenshot-gallery">
              {randomItems(previews, Math.min(3, previews.length)).map(({ file, url }) => (
                <figure className="uploaded-screenshot" key={`${file.name}-${file.lastModified}`}>
                  <img src={url} alt={file.name} />
                  <figcaption>{file.name}</figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="uploaded-screenshot-gallery sample-screenshot-gallery">
              {sampleGallery.map((screenshot) => <SampleScreenshot key={screenshot.title} screenshot={screenshot} />)}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
