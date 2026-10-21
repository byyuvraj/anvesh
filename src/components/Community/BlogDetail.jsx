import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import parse from 'html-react-parser';
import { MessageCircle, ArrowLeft, Send, Sparkles, Heart, Bookmark, Share2, Check, Clock, Tag, MapPin } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import CoverImage from './CoverImage';
import StoryAudioPlayer from '../StoryAudioPlayer';

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const fetchBlog = async () => {
    try {
      const { data } = await api.get(`/blogs/${id}`);
      setBlog(data);
      setIsLiked(Boolean(data.isLiked));
      setLikesCount(data.likesCount || 0);
      setIsBookmarked(Boolean(data.isBookmarked));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Optimistic update
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const { data } = await api.post(`/blogs/${id}/like`);
      setIsLiked(data.liked);
      setLikesCount(data.likeCount);
    } catch (err) {
      console.error(err);
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const prevBookmarked = isBookmarked;
    setIsBookmarked(!prevBookmarked);

    try {
      const { data } = await api.post(`/blogs/${id}/bookmark`);
      setIsBookmarked(data.bookmarked);
    } catch (err) {
      console.error(err);
      setIsBookmarked(prevBookmarked);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setSubmittingComment(true);
    try {
      await api.post(`/blogs/${id}/comments`, { text: commentText });
      setCommentText('');
      fetchBlog();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return <div className="text-center py-40 font-black text-3xl tracking-tighter text-stone-400">Loading story...</div>;
  if (!blog) return <div className="text-center py-40 font-black text-3xl tracking-tighter text-stone-400">Story not found.</div>;

  return (
    <div className="w-full flex flex-col relative animate-in fade-in duration-700 pb-20">
      
      {/* Floating Back Button & Quick Actions */}
      <div className="fixed top-24 left-4 xl:left-10 z-40 hidden lg:flex flex-col gap-3">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center justify-center w-12 h-12 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200 dark:border-stone-800 rounded-full text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:scale-110 transition-all shadow-sm"
          title="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Floating Like Button */}
        <button 
          onClick={handleToggleLike}
          className={`flex flex-col items-center justify-center w-12 h-14 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border rounded-2xl transition-all shadow-sm group ${
            isLiked 
              ? 'border-red-400 text-red-500 bg-red-50/50 dark:bg-red-950/20' 
              : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:text-red-500'
          }`}
          title={isLiked ? "Unlike story" : "Like story"}
        >
          <Heart className={`w-5 h-5 transition-transform group-hover:scale-125 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          <span className="text-[10px] font-black mt-0.5">{likesCount}</span>
        </button>

        {/* Floating Bookmark Button */}
        <button 
          onClick={handleToggleBookmark}
          className={`flex items-center justify-center w-12 h-12 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border rounded-full transition-all shadow-sm group ${
            isBookmarked 
              ? 'border-[#8ab836] text-[#8ab836] bg-[#8ab836]/10' 
              : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:text-[#8ab836]'
          }`}
          title={isBookmarked ? "Remove from Bucket List" : "Save to Bucket List"}
        >
          <Bookmark className={`w-5 h-5 transition-transform group-hover:scale-110 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>

        {/* Floating Share Button */}
        <button 
          onClick={handleShare}
          className="flex items-center justify-center w-12 h-12 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200 dark:border-stone-800 rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 hover:scale-110 transition-all shadow-sm"
          title="Copy link to clipboard"
        >
          {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="max-w-[900px] mx-auto w-full px-4 lg:px-0 pt-10">
        
        <button onClick={() => navigate(-1)} className="inline-flex lg:hidden items-center gap-2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 font-bold text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to explorer
        </button>

        {/* Title Section */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-stone-400 font-bold tracking-[0.3em] text-xs uppercase">Travel Journal</span>
            {blog.location?.name && (
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#c8ff00]/20 text-stone-800 dark:text-[#c8ff00] px-2.5 py-0.5 rounded-full">
                <MapPin className="w-3 h-3" /> {blog.location.name}
              </span>
            )}
            {blog.readingTime && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-400">
                <Clock className="w-3 h-3" /> {blog.readingTime} min read
              </span>
            )}
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-stone-900 dark:text-white leading-[1.1] mb-8 font-serif tracking-tighter">
            {blog.title}
          </h1>

          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden border-2 border-white dark:border-stone-700 shadow-md">
              {blog.user.profilePicture ? (
                <img src={blog.user.profilePicture} alt={blog.user.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#c8ff00] flex items-center justify-center text-stone-900 font-bold">{blog.user.username[0].toUpperCase()}</div>
              )}
            </div>
            <div className="text-left">
              <h4 className="font-bold text-stone-800 dark:text-stone-200 text-sm">@{blog.user.username}</h4>
              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span className="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded text-stone-600 dark:text-stone-300 font-bold">{blog.user.travelStyle || 'Traveler'}</span>
              </div>
            </div>
          </div>

          {/* Mobile Action Bar */}
          <div className="flex lg:hidden items-center justify-center gap-3 mt-8">
            <button 
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                isLiked ? 'bg-red-50 border-red-300 text-red-500' : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} /> {likesCount} Likes
            </button>
            <button 
              onClick={handleToggleBookmark}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                isBookmarked ? 'bg-[#8ab836]/15 border-[#8ab836] text-[#8ab836]' : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} /> {isBookmarked ? 'Saved' : 'Bucket List'}
            </button>
            <button 
              onClick={handleShare}
              className="p-2 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Audio Narrator Bar */}
      <div className="max-w-[900px] mx-auto w-full px-4 lg:px-0">
        <StoryAudioPlayer 
          title={blog.title} 
          summary={blog.aiSummary} 
          content={blog.richContent} 
        />
      </div>

      {/* Hero Cover Image */}
      <div className="w-full max-w-[1200px] mx-auto h-[350px] sm:h-[550px] rounded-[2rem] overflow-hidden mb-12 shadow-xl relative group border border-stone-200 dark:border-stone-800">
        <CoverImage 
          src={blog.coverImage} 
          alt={blog.title} 
          locationName={blog.location?.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
        />
      </div>

      <div className="max-w-[800px] mx-auto w-full px-4 lg:px-0">
        
        {/* AI Key Insights / Summary Callout */}
        {blog.aiSummary && (
          <div className="mb-12 p-6 rounded-3xl bg-stone-50 dark:bg-stone-900 border border-[#8ab836]/30 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2 text-[#8ab836] dark:text-[#c8ff00]">
              <Sparkles className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase tracking-wider">AI Executive Brief</span>
            </div>
            <p className="text-stone-700 dark:text-stone-300 font-medium text-sm sm:text-base leading-relaxed italic">
              "{blog.aiSummary}"
            </p>
          </div>
        )}

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {blog.tags.map((tag, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-3 py-1 rounded-full border border-stone-200 dark:border-stone-700">
                <Tag className="w-3 h-3 text-[#8ab836]" />
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}

        {/* Rich Text Editorial Body */}
        <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 mb-20 font-serif leading-loose prose-p:mb-8 prose-img:rounded-3xl prose-img:shadow-xl prose-headings:font-sans prose-headings:font-black prose-headings:tracking-tight prose-headings:text-stone-900 dark:prose-headings:text-white prose-a:text-[#8ab836] dark:prose-a:text-[#c8ff00] hover:prose-a:text-[#729c29] dark:hover:prose-a:text-[#b8f200] prose-blockquote:border-l-4 prose-blockquote:border-[#8ab836] dark:prose-blockquote:border-[#c8ff00] prose-blockquote:bg-stone-50 dark:prose-blockquote:bg-stone-800/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:font-normal prose-blockquote:italic prose-blockquote:text-stone-600 dark:prose-blockquote:text-stone-400">
          {parse(blog.richContent)}
        </div>

        {/* End of Story Divider */}
        <div className="flex items-center justify-center gap-4 mb-20 opacity-50">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-stone-300 dark:to-stone-600" />
          <Sparkles className="w-5 h-5 text-stone-400 dark:text-stone-500" />
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-stone-300 dark:to-stone-600" />
        </div>

        {/* Comments Section */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[2.5rem] p-8 sm:p-12 shadow-sm">
          <h3 className="text-2xl font-black text-stone-900 dark:text-white mb-10 flex items-center gap-3 font-serif">
            Responses <span className="bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 px-3 py-1 rounded-full text-sm font-sans">{blog.comments.length}</span>
          </h3>

          {isAuthenticated ? (
            <form onSubmit={handleComment} className="flex flex-col gap-4 mb-12 bg-stone-50 dark:bg-stone-950 p-6 rounded-3xl border border-stone-100 dark:border-stone-800">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden flex-shrink-0 border border-stone-300 dark:border-stone-700">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="You" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#c8ff00] flex items-center justify-center font-bold text-stone-900">{user?.username[0].toUpperCase()}</div>
                  )}
                </div>
                <textarea 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="What are your thoughts?"
                  rows={3}
                  className="flex-grow bg-transparent border-none px-2 py-2 text-sm focus:outline-none resize-none font-medium placeholder-stone-400 dark:placeholder-stone-500 text-stone-800 dark:text-stone-200"
                />
              </div>
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  disabled={submittingComment || !commentText.trim()}
                  className="bg-stone-900 dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 px-6 py-2.5 rounded-full font-bold transition-all disabled:opacity-50 flex items-center gap-2 text-sm shadow-md"
                >
                  Respond <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-stone-50 dark:bg-stone-950 p-8 rounded-3xl text-center mb-12 border border-stone-100 dark:border-stone-800">
              <h4 className="text-stone-800 dark:text-stone-200 font-bold mb-2">Join the conversation</h4>
              <p className="text-stone-500 dark:text-stone-400 text-sm mb-5">Sign in to leave a response and share your thoughts.</p>
              <Link to="/login" className="bg-[#c8ff00] hover:bg-[#b8f200] text-stone-900 px-8 py-3 rounded-full font-bold shadow-md transition-all inline-block">Login to Anvesh</Link>
            </div>
          )}

          <div className="flex flex-col gap-10">
            {blog.comments.map(comment => (
              <div key={comment.id} className="flex gap-5">
                <div className="w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden flex-shrink-0 border border-stone-300 dark:border-stone-700">
                  {comment.user.profilePicture ? (
                    <img src={comment.user.profilePicture} alt={comment.user.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#c8ff00] flex items-center justify-center font-bold text-stone-900">{comment.user.username[0].toUpperCase()}</div>
                  )}
                </div>
                <div className="flex-grow pt-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-stone-800 dark:text-stone-200 text-sm">@{comment.user.username}</span>
                    <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-2 py-0.5 rounded-full">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed font-serif">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
