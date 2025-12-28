import { useState, useEffect, useRef } from 'react';
import { useAppStateContext } from '../context/AppContext';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import type { DiaryPost } from '../types';
import './DiaryScreen.css';

export const DiaryScreen = () => {
    const { state } = useAppStateContext();
    const [posts, setPosts] = useState<DiaryPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // Form State
    const [content, setContent] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('😊');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    
    // Full image viewer state
    const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentUser = state.familyMembers[state.currentFamily];
    const emojis = ['😊', '😍', '🤣', '😎', '🤔', '😴', '🤩', '🥳', '🤯', '🏖️', '🍜', '🐘'];

    const clearAllPosts = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить ВСЕ записи из дневника? Это действие необратимо.')) {
            return;
        }

        setLoading(true);
        try {
            const q = query(collection(db, 'diary_posts'));
            const querySnapshot = await getDocs(q);
            
            const deletePromises = querySnapshot.docs.map(document => 
                deleteDoc(doc(db, 'diary_posts', document.id))
            );
            
            await Promise.all(deletePromises);
            addLog('🗑️ Дневник полностью очищен');
        } catch (error) {
            console.error("Error clearing diary:", error);
            alert('Ошибка при очистке дневника');
        } finally {
            setLoading(false);
        }
    };

    // Функция логирования
    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
    };

    // Функция сжатия изображения с динамическим качеством
    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            addLog(`🖼️ Начало сжатия. Размер: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
            
            // Если файл менее 2MB, отправляем как есть (для избежания зависания)
            if (file.size < 2 * 1024 * 1024) {
                addLog('✅ Файл < 2MB, используем оригинал');
                resolve(new Blob([file], { type: file.type || 'image/jpeg' }));
                return;
            }

            const reader = new FileReader();
            let readerTimeout: ReturnType<typeof setTimeout> | null = null;

            reader.onload = (event) => {
                if (readerTimeout) clearTimeout(readerTimeout);
                addLog('✅ FileReader завершен');
                
                const img = new Image();
                let imageLoadTimeout: ReturnType<typeof setTimeout> | null = null;

                img.onload = () => {
                    if (imageLoadTimeout) clearTimeout(imageLoadTimeout);
                    addLog(`📏 Исходное разрешение: ${img.width}x${img.height}`);
                    
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    const maxWidth = 1024;
                    const maxHeight = 1024;
                    
                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }
                    
                    addLog(`📐 Новое разрешение: ${width}x${height}`);
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        addLog('❌ Не удалось получить canvas context');
                        reject(new Error('Canvas context error'));
                        return;
                    }

                    try {
                        ctx.drawImage(img, 0, 0, width, height);
                    } catch (error) {
                        addLog(`❌ Ошибка drawImage: ${error}`);
                        reject(error);
                        return;
                    }
                    
                    const fileSizeMB = file.size / (1024 * 1024);
                    let quality = 0.7;
                    
                    if (fileSizeMB > 5) {
                        quality = 0.5;
                    } else if (fileSizeMB > 3) {
                        quality = 0.6;
                    } else {
                        quality = 0.75;
                    }
                    
                    addLog(`🎯 Качество: ${(quality * 100).toFixed(0)}% для ${fileSizeMB.toFixed(2)} MB`);
                    addLog('⏳ Начало toBlob()...');
                    
                    let blobTimeout: ReturnType<typeof setTimeout> | null = null;
                    const blobPromise = new Promise<Blob>((blobResolve, blobReject) => {
                        // Таймаут для toBlob (15 секунд)
                        blobTimeout = setTimeout(() => {
                            addLog('❌ toBlob() истёк таймаут (15s), используем fallback');
                            // Fallback: используем canvas как есть с более низким качеством
                            canvas.toBlob(
                                (blob) => {
                                    if (blob) {
                                        blobResolve(blob);
                                    } else {
                                        blobReject(new Error('Canvas blob conversion failed'));
                                    }
                                },
                                file.type || 'image/jpeg',
                                0.4
                            );
                        }, 15000);

                        canvas.toBlob(
                            (blob) => {
                                if (blobTimeout) clearTimeout(blobTimeout);
                                
                                if (blob) {
                                    addLog(`✨ toBlob завершен! Новый размер: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
                                    blobResolve(blob);
                                } else {
                                    addLog('❌ Canvas blob conversion failed');
                                    blobReject(new Error('Canvas blob conversion failed'));
                                }
                            },
                            file.type || 'image/jpeg',
                            quality
                        );
                    });

                    blobPromise.then(resolve).catch(reject);
                };

                img.onerror = () => {
                    if (imageLoadTimeout) clearTimeout(imageLoadTimeout);
                    addLog('❌ Image loading failed');
                    reject(new Error('Image loading failed'));
                };

                // Таймаут для загрузки изображения (10 секунд)
                imageLoadTimeout = setTimeout(() => {
                    addLog('❌ Image load истёк таймаут (10s)');
                    reject(new Error('Image load timeout'));
                }, 10000);

                img.src = event.target?.result as string;
            };

            reader.onerror = () => {
                if (readerTimeout) clearTimeout(readerTimeout);
                addLog('❌ FileReader error');
                reject(new Error('FileReader error'));
            };

            // Таймаут для FileReader (5 секунд)
            readerTimeout = setTimeout(() => {
                addLog('❌ FileReader истёк таймаут (5s)');
                reject(new Error('FileReader timeout'));
            }, 5000);

            reader.readAsDataURL(file);
        });
    };

    // Real-time subscription
    useEffect(() => {
        const q = query(collection(db, 'diary_posts'), orderBy('timestamp', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedPosts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as DiaryPost[];
            
            setPosts(loadedPosts);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching diary posts:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMediaFile(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!content.trim() && !mediaFile) return;
        
        setIsSubmitting(true);
        
        try {
            let mediaUrl: string | null = null;
            
            // Upload image to Firebase Storage
            if (mediaFile) {
                setUploadProgress(10);
                
                try {
                    // Сжимаем изображение с общим таймаутом
                    const compressPromise = compressImage(mediaFile);
                    const timeoutPromise = new Promise<Blob>((_, reject) =>
                        setTimeout(() => reject(new Error('Сжатие изображения заняло слишком много времени. Попробуйте меньшее изображение.')), 30000)
                    );
                    
                    const compressedBlob = await Promise.race([compressPromise, timeoutPromise]);
                    setUploadProgress(50);
                    addLog('⏳ Начало загрузки на Firebase Storage...');
                    
                    // Загружаем в Storage
                    const timestamp = Date.now();
                    const fileName = `${state.currentFamily}_${timestamp}_${mediaFile.name}`;
                    const storageRef = ref(storage, `diary/${state.currentFamily}/${fileName}`);
                    
                    // Преобразуем Blob в File для лучшей совместимости с iOS
                    const fileToUpload = new File([compressedBlob], fileName, { 
                        type: mediaFile.type || 'image/jpeg' 
                    });
                    
                    // Используем uploadBytes для загрузки
                    await uploadBytes(storageRef, fileToUpload);
                    mediaUrl = await getDownloadURL(storageRef);
                    addLog(`✅ Фото успешно загружено! URL: ${mediaUrl.substring(0, 50)}...`);
                    setUploadProgress(100);
                } catch (compressionError) {
                    addLog(`❌ Ошибка при обработке/загрузке фото: ${compressionError instanceof Error ? compressionError.message : String(compressionError)}`);
                    throw compressionError;
                }
            }

            // Save to Firestore with Storage URL
            addLog('💾 Сохранение записи в Firestore...');
            await addDoc(collection(db, 'diary_posts'), {
                author: {
                    id: String(state.currentFamily),
                    name: currentUser.name,
                    avatar: currentUser.emoji
                },
                content,
                emoji: selectedEmoji,
                media: mediaUrl ? { url: mediaUrl, type: 'image' } : null,
                timestamp: serverTimestamp()
            });
            
            addLog('✨ Запись успешно опубликована!');

            // Reset form
            setContent('');
            setMediaFile(null);
            setMediaPreview(null);
            setIsFormOpen(false);
            setUploadProgress(0);
            
        } catch (error) {
            console.error("Error creating post:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            alert(`Ошибка: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (timestamp: Timestamp | null) => {
        if (!timestamp || !timestamp.toDate) return '';
        // Handle Firestore Timestamp
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="diary-screen">
            <div className="diary-header">
                <div className="header-top">
                    <h2>📔 Семейный Дневник</h2>
                    {state.currentFamily === 0 && (
                        <button className="clear-all-btn" onClick={clearAllPosts} title="Очистить всё (только для папы)">
                            🗑️
                        </button>
                    )}
                </div>
                <p>Сохраняем лучшие моменты путешествия</p>
            </div>

            <button className="create-post-trigger" onClick={() => setIsFormOpen(true)}>
                <span>✨</span> Поделиться моментом
            </button>

            {loading ? (
                <div className="loading-state">Загрузка дневника...</div>
            ) : posts.length === 0 ? (
                <div className="empty-state">
                    <p>Пока нет записей. Будьте первыми!</p>
                </div>
            ) : (
                <div className="diary-feed">
                    {posts.map(post => (
                        <div key={post.id} className="diary-card">
                            <div className="card-header">
                                <div className="author-avatar">{post.author.avatar}</div>
                                <div className="author-info">
                                    <div className="author-name">{post.author.name}</div>
                                    <div className="post-date">
                                        {post.timestamp && 'toDate' in post.timestamp 
                                            ? formatTime(post.timestamp as Timestamp)
                                            : 'Только что'}
                                    </div>
                                </div>
                            </div>
                            
                            {post.content && <div className="post-content">{post.content}</div>}
                            
                            {post.media && (
                                <div className="post-image">
                                    <img 
                                        src={post.media.url} 
                                        alt="Moment" 
                                        loading="lazy"
                                        onClick={() => post.media && setFullImageUrl(post.media.url)}
                                        className="post-thumbnail"
                                    />
                                </div>
                            )}
                            
                            <div className="post-emoji-horizontal">
                                {post.emoji}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Post Modal */}
            {isFormOpen && (
                <div className="post-form-overlay" onClick={(e) => e.target === e.currentTarget && setIsFormOpen(false)}>
                    <div className="post-form-container">
                        <div className="form-header">
                            <h3>Новая запись</h3>
                            <button className="close-btn" onClick={() => setIsFormOpen(false)}>✕</button>
                        </div>

                        <div className="emoji-picker">
                            {emojis.map(emoji => (
                                <div 
                                    key={emoji}
                                    className={`emoji-option ${selectedEmoji === emoji ? 'selected' : ''}`}
                                    onClick={() => setSelectedEmoji(emoji)}
                                >
                                    {emoji}
                                </div>
                            ))}
                        </div>

                        <textarea
                            className="post-input"
                            placeholder={`Что интересного случилось, ${currentUser.name}?`}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />

                        {mediaPreview && (
                            <div className="media-preview">
                                <img src={mediaPreview} alt="Preview" />
                                <button className="remove-media-btn" onClick={() => {
                                    setMediaFile(null);
                                    setMediaPreview(null);
                                }}>✕</button>
                            </div>
                        )}

                        {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        )}

                        <div className="form-actions">
                            <button className="attach-btn" onClick={() => fileInputRef.current?.click()}>
                                📷 Фото
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleFileSelect}
                            />

                            <button 
                                className="submit-btn"
                                onClick={handleSubmit}
                                disabled={isSubmitting || (!content.trim() && !mediaFile)}
                            >
                                {isSubmitting ? 'Публикация...' : 'Опубликовать'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Full Image Viewer Modal */}
            {fullImageUrl && (
                <div className="image-viewer-overlay" onClick={() => setFullImageUrl(null)}>
                    <div className="image-viewer-container">
                        <button className="close-viewer-btn" onClick={() => setFullImageUrl(null)}>✕</button>
                        <img src={fullImageUrl} alt="Full view" className="full-image" />
                    </div>
                </div>
            )}
        </div>
    );
};