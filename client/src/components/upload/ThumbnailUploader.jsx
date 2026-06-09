import { useRef } from "react";
import YoutubeIcon from "../common/YoutubeIcon.jsx";

export default function ThumbnailUploader({ file, previewUrl, onSelect }) {
  const inputRef = useRef(null);

  function selectFile(nextFile) {
    if (nextFile) onSelect(nextFile);
  }

  return (
    <section
      className={file ? "upload-dropzone thumbnail-dropzone studio-thumbnail-drop has-file" : "upload-dropzone thumbnail-dropzone studio-thumbnail-drop"}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        selectFile(event.dataTransfer.files?.[0]);
      }}
    >
      <input
        accept="image/*"
        className="sr-only"
        onChange={(event) => selectFile(event.target.files?.[0])}
        ref={inputRef}
        type="file"
      />
      {previewUrl ? (
        <img alt="Selected thumbnail preview" className="upload-thumbnail-preview" src={previewUrl} />
      ) : (
        <div className="upload-dropzone-empty">
          <span className="studio-mini-icon">
            <YoutubeIcon name="theater" size={22} />
          </span>
          <strong>Thumbnail</strong>
          <span>16:9 JPG, PNG, WebP</span>
        </div>
      )}
      <button className="button studio-secondary-button" onClick={() => inputRef.current?.click()} type="button">
        <YoutubeIcon name="plus" size={17} />
        {file ? "Change thumbnail" : "Choose thumbnail"}
      </button>
      {file ? <p className="upload-file-meta">{file.name}</p> : null}
    </section>
  );
}
