import { FaRegFilePdf, FaRegFileWord, FaRegFile, FaArrowAltCircleDown } from 'react-icons/fa';
import "../styles/FilePreview.css";

interface FilePreviewProps {
    fileName?: string;
    fileType?: string;
    fileUrl?: string;
    index: number;
    onDownload: (_event:React.MouseEvent<HTMLButtonElement, MouseEvent>, index:number) => void;
}

const FilePreview = ({ fileName, fileType, fileUrl, onDownload, index }: FilePreviewProps) => {
  const renderFileIcon = () => {
    switch (fileType) {
      case 'application/pdf':
        return <FaRegFilePdf className="file-icon pdf-file" />;
      case 'image/jpeg':
      case 'image/jpg':
      case 'image/png':
      case 'image/gif':
        return <img src={fileUrl?.startsWith('http') ? fileUrl: getBlobFromFile() } alt={fileName} className="file-image" />;
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return <FaRegFileWord className="file-icon word-file" />;
      default:
        return <FaRegFile className="file-icon" />;
    }
  };

  const getBlobFromFile = () =>{
    const base64Content = fileUrl || "";
    const mimeType = fileType || "blob";
    const byteCharacters = atob(base64Content); // Decode Base64
    const byteNumbers = Array.from(byteCharacters).map((char) => char.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);

    // Create a Blob
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);
    return url
  }

  return (
    <div className="file-preview">
      <div className="file-preview-icon">
        {renderFileIcon()}
      </div>
      <div className="file-preview-details">
        <span className="file-name">{fileName}</span>
        <button onClick={(e)=>onDownload && onDownload(e, index)} className="download-button">
            <FaArrowAltCircleDown/>
        </button>
      </div>
    </div>
  );
};

export default FilePreview;