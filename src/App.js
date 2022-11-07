import Dropzone from "components/dropzone"
import DropZoneMultipart from "components/dropzoneMultipart";

function App() {
  return (
    <div>      
      <h1>1. Chunk</h1>
      <Dropzone></Dropzone>      
      <h2>2. Multipart</h2>
      <DropZoneMultipart></DropZoneMultipart>
    </div>
  );
}

export default App;
