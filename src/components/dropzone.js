import React, { useEffect, useRef, useState } from 'react';
import apiService from 'util/axios';
import {v4 as uuidv4} from 'uuid';
import md5 from "md5";
import { DropZoneDiv, DropZoneLabel, FileDiv, ProgressDiv, FileNameDiv, UploadTimeDiv } from 'styles/dropzone';

const CHUNK_SIZE = 1048576 * 3; //3MB


const DropZone = ({}) => {
    const [dropzoneActive, setDropzoneActive] = useState(false);
    const [files, setFiles] = useState([]);

    const [curFileIdx, setCurFileIdx] = useState(null);
    const [lastUploadedFileIdx, setLastUploadedFileIdx] = useState(null);    

    const [curChunkIdx, setCurChunkIdx] = useState(null);    

    const [fileUuid, setFileUuid] = useState('');
    const [isLastFile, setIsLastFile] = useState(false);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const curRowIdx = useRef(0);
    const firstColNames = useRef('');

    const handleDrop = (e) => {
        e.preventDefault();
        const fileArray = Array.from(e.dataTransfer.files);
        setFiles([...files, ...fileArray]);
        
    };

    const handleSelectFiles = (e) => {
        if(e.currentTarget.files) {
            const fileArray = Array.from(e.currentTarget.files);
            setFiles([...files, ...fileArray]);
        }        
    };

    useEffect(() => {
        if(files.length > 0) {
            if(curFileIdx === null) {
                setFileUuid(uuidv4());
                setCurFileIdx(lastUploadedFileIdx === null ? 0 : lastUploadedFileIdx + 1);
            }
        }
        
    }, [files.length]);

    useEffect(() => {
        if(curFileIdx !== null) {
            const now = new Date();
            setStartDate(now);
            setCurChunkIdx(0);
        }        
    }, [curFileIdx]);

    useEffect(() => {
        if(curChunkIdx !== null) {
            readAndUploadCurChunk();
        }
    }, [curChunkIdx, curRowIdx]);

    const readAndUploadCurChunk = () => {
        if(curFileIdx !== null && curChunkIdx != null) {
            const reader = new FileReader();
            const file = files[curFileIdx];
            if(!file) {
                return;
            }
            const from = curChunkIdx * CHUNK_SIZE;
            const to = from + CHUNK_SIZE;
            const blob = file.slice(from, to);
            reader.onload = (e) => uploadChunk(e);
            reader.readAsDataURL(blob);
        }
    };

    const uploadChunk = (e) => {        
        if(curFileIdx !== null && curChunkIdx !== null) {
            const file = files[curFileIdx];
            const data = e.target.result;            
            const name = file.name;            
            // const md5Name = md5(name);            

            // const params = new URLSearchParams();
            // params.set('name', name);
            // params.set('md5Name', md5Name);
            // params.set('size', file.size.toString());
            // params.set('curChunkIdx', `${curChunkIdx}`);
            // params.set('totalChunks', `${Math.ceil(file.size / CHUNK_SIZE)}`)
            const headers = {
                'Content-Type': 'application/octet-stream',
                'dataType': 'tabular',
                'fileName': name,
                'fileUuid': fileUuid,
                // 'md5Name': md5Name,
                'size': file.size,
                'curChunkIdx': curChunkIdx,
                'totalChunks': Math.ceil(file.size / CHUNK_SIZE),
                'curRowIdx': Number(curRowIdx.current),
                'firstColNames': firstColNames.current ? firstColNames.current : '',
            };
            const url = `upload/`;
            
            const promise = apiService.post(url, data, {headers});
            if(!promise) {
                return;
            }
            promise.then(res => {                    
                const fileSize = files[curFileIdx].size;
                const isLastChunk = curChunkIdx === Math.ceil(fileSize / CHUNK_SIZE) - 1;
                if(isLastChunk) {
                    // file.finalFileName = res.data.final_file_name;                        
                    setLastUploadedFileIdx(curFileIdx);
                    setCurChunkIdx(null);
                    setDropzoneActive(false);

                    const now = new Date();
                    setEndDate(now);
                } else {
                    // setTimeout(() => {
                    setCurChunkIdx(curChunkIdx + 1);
                    // }, 50);
                    curRowIdx.current = res.data.cur_row_idx;
                    firstColNames.current = res.data.first_col_names;

                }                
            });
            const now = new Date();
            setEndDate(now);
        }        
    };

    useEffect(() => {
        if(curFileIdx !== null) {
            if(lastUploadedFileIdx === null) {
                return;
            }
            const isLastFileLocal = lastUploadedFileIdx === files.length - 1
            const nextFileIdx = isLastFileLocal ? null : curFileIdx + 1;
            setCurFileIdx(nextFileIdx);
            
            setIsLastFile(isLastFileLocal);
        }
    }, [lastUploadedFileIdx]);

    useEffect(() => {
        if(isLastFile) {
            setFiles([]);
            setCurFileIdx(null);
            setIsLastFile(false);
            setLastUploadedFileIdx(null);
            curRowIdx.current = 0;
            firstColNames.current = '';
        }
    }, [isLastFile])

    return (
        <div>
            <DropZoneDiv
                onDragOver={(e) => {
                    setDropzoneActive(true);
                    e.preventDefault();
                }}
                onDragLeave={(e) => {
                    setDropzoneActive(false);
                    e.preventDefault();
                }}
                onDrop={(e) => handleDrop(e)}
                isActive={dropzoneActive}
            >
                <DropZoneLabel>
                    <input type="file" multiple onChange={handleSelectFiles} />
                </DropZoneLabel>

            </DropZoneDiv>    
            <FileDiv>
                {files.map((file, fileIdx) => {
                    let progress = 0;
                    if(file.finalFileName) {
                        progress = 100;
                    } else {
                        const uploading = fileIdx === curFileIdx;
                        const chunks = Math.ceil(file.size / CHUNK_SIZE);
                        if(uploading) {                            
                            progress = curChunkIdx !== null ? Math.ceil(curChunkIdx / chunks * 100) : 0;
                        } else {
                            progress = 0;
                        }
                    }
                    return (
                        <a key={file.name} className='file' target="_blank">
                            <FileNameDiv className='name'>{file.name}</FileNameDiv>
                            <ProgressDiv style={{
                                width: progress+'%'
                            }}>{Math.round(progress)}%</ProgressDiv>
                        </a>
                    )
                })}
            </FileDiv>
            {
                startDate && endDate && (
                    <UploadTimeDiv>
                        소요시간(초) : {Math.round((endDate.getTime() - startDate.getTime())/1000)}
                    </UploadTimeDiv>
                )
            }
        </div>
    );
};

export default DropZone;