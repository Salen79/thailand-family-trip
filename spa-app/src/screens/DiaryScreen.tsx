import { useState, useEffect, useRef } from 'react';
import { useAppStateContext } from '../context/AppContext';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
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

    // Функция сжатия изображения
    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Максимальное разрешение: 1200px
                    const maxWidth = 1200;
                    const maxHeight = 1200;
                    
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
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                    }
                    
                    canvas.toBlob(
                        (blob) => {
                            resolve(blob || file);
                        },
                        file.type || 'image/jpeg',
                        0.8 // качество 80%
                    );
                };
                img.src = event.target?.result as string;
            };
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
                
                // Сжимаем изображение
                const compressedBlob = await compressImage(mediaFile);
                setUploadProgress(50);
                
                // Загружаем в Storage
                const timestamp = Date.now();
                const fileName = `${state.currentFamily}_${timestamp}_${mediaFile.name}`;
                const storageRef = ref(storage, `diary/${state.currentFamily}/${fileName}`);
                
                await uploadBytes(storageRef, compressedBlob);
                setUploadProgress(80);
                
                // Получаем URL для скачивания
                mediaUrl = await getDownloadURL(storageRef);
                setUploadProgress(100);
            }

            // Save to Firestore with Storage URL
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
                <h2>📔 Семейный Дневник</h2>
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
                                            ? formatTime(post.timestamp as any)
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