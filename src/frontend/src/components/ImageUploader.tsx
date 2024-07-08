import React, { useState } from 'react';
import { Button, IconButton, InputLabel, Paper, styled, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { ClearIcon } from '@mui/x-date-pickers';
import CameraEnhanceOutlinedIcon from '@mui/icons-material/CameraEnhanceOutlined';
import axios from 'axios';
import ImageService from '../services/ImageService';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const ImageUploader = (props: {onGetImgUrl: Function}) => {
    const [imageUrl, setImageUrl] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleImageUpload = async (value: string) => {
        setImageUrl(value);
        setLoading(true);
        try {
            const response = await fetch(value);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            setImage(objectUrl);
            props.onGetImgUrl(objectUrl);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageDelete = async () => {
        setImageUrl('');
        setImage(null);
        props.onGetImgUrl('');
    }

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent) => {
        setIsDragging(false);
    };

    const handleDrop = async (event: React.DragEvent) => {
        //TODO:Проработать загрузку изображения через DnD, генерацию ссылки для поля ввода
        event.preventDefault();
        const file: File = event.dataTransfer.files[0] as File;
        uploadNewImage(file);
    };

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file: any = event.target.files ? event.target.files[0] as File : null;
        if (file) {
            uploadNewImage(file);
        }
      };

      const uploadNewImage = async (file: any) => {
        const allowedExtensions = ['jpeg', 'jpg', 'png', 'svg'];
        const isImage = allowedExtensions.includes(file.name.split('.').pop().toLowerCase());
        
        const formData = new FormData();
        formData.append('file', file);
    

        if (isImage) {
            try {
                const response = await ImageService.uploadImage(formData);
                const objectUrl = response.data.image_url;
                setImage(objectUrl);
                props.onGetImgUrl(objectUrl);
            } catch (error) {
                console.error(error);
            }
            setIsDragging(false);
        
        } else {
            alert('Неверный тип файла. Пожалуйста, выберите изображение.');
        }
      }
      
    return (
        <div>
            <InputLabel htmlFor="wishImg" sx={{ mb: 1 }}>
                Изображение подарка
            </InputLabel>
            <div className='flex'>
                <Button
                    sx={{
                        mb: 2,
                        height: '120px',
                        width: '120px',
                        border: isDragging ? '1px dashed #4c4ca9' : '1px dashed #56569c',
                        boxShadow: 'none',
                        background: 'none',
                        overflow: 'hidden',
                        borderRadius: 1,
                        display: 'flex', flexDirection: 'column', gap: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: isDragging ? 'pointer' : 'default',
                        padding: 0
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}>
                    <CameraEnhanceOutlinedIcon fontSize='large' sx={{ position: 'absolute' }} />
                    <input type="file" accept=".jpeg,.jpg,.png,.webp" onChange={onFileChange} className='w-full h-full' style={{ opacity: 0, position: 'absolute' }}/>
                    {image &&
                        <img src={image} alt="Загруженное изображение" width="120px" />}
                </Button>
                <div className='pl-4 w-full'>
                    <TextField
                        label="Вставьте ссылку на изображение"
                        value={imageUrl}
                        margin="dense"
                        fullWidth
                        id="wishImg"
                        placeholder='Ссылка'
                        name="wishImg"
                        onChange={(event) => handleImageUpload(event.target.value)}
                        InputProps={{
                            endAdornment: imageUrl && <IconButton onClick={handleImageDelete}>
                                <ClearIcon />
                            </IconButton>
                        }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    {image &&
                        <Button variant="text"
                            onClick={handleImageDelete}>
                            Удалить
                        </Button>}
                </div>
            </div>

        </div>
    );
};

export default ImageUploader;
