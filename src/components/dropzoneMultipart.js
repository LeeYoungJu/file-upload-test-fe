import React, { useEffect, useState } from 'react';
import apiService from 'util/axios';
import {v4 as uuidv4} from 'uuid';
import { DropZoneDiv, DropZoneLabel, FileDiv, ProgressDiv, FileNameDiv, UploadTimeDiv } from 'styles/dropzone';


const DropZoneMultipart = ({}) => {
    const [dropzoneActive, setDropzoneActive] = useState(false);
    
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [progress, setProgress] = useState(0);

    const [files, setFiles] = useState([]);    

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
            sendFile();
        }
        
    }, [files.length]);

    const sendFile = () => {    
        setStartDate(null);
        setEndDate(null);
        
        const now = new Date();
        setStartDate(now);

        const uuid = uuidv4();

        const formData = new FormData();
        formData.append('file', files[0]);
        
        const url = 'upload/dataset/';

        const promise = apiService.postForm(url, formData, (e) => {
            const percentage = (e.loaded * 100) / e.total;
            setProgress(percentage);
        });
        if(!promise) {
            return;
        }
        promise.then(res => {
            console.log(res);
            const now = new Date();
            setEndDate(now);
            resetData();
        });    
    };

    const resetData = () => {
        setFiles([]);
        setProgress(0);
        // setStartDate(null);
        // setEndDate(null);
    };

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
                    <input accept='image/*, .csv' type="file" onChange={handleSelectFiles} />
                </DropZoneLabel>

            </DropZoneDiv>    
            <FileDiv>
                {files.map((file) => {                    
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
                progress === 100 && (
                    <div>
                        Please wait...
                    </div>
                )
            }
            {
                startDate && endDate && (
                    <UploadTimeDiv>
                        소요시간(초) : {Math.round((endDate.getTime() - startDate.getTime())/1000)}
                    </UploadTimeDiv>
                )
            }
        </div>
    )
};

export default DropZoneMultipart;