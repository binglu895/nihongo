import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { addXP } from '../services/gamificationService';

const PronunciationPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recognizedText, setRecognizedText] = useState('');
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [preferredLang, setPreferredLang] = useState('English');
    const [overallProgress, setOverallProgress] = useState({ learned: 0, total: 0 });
    const [totalDueToday, setTotalDueToday] = useState(0);
    const [reviewedTodayCount, setReviewedTodayCount] = useState(0);
    const [lastGainedXP, setLastGainedXP] = useState<number | null>(null);
    const [xpNotificationKey, setXpNotificationKey] = useState(0);
    const [showReportMenu, setShowReportMenu] = useState(false);
    const [isReporting, setIsReporting] = useState(false);
    const [reportStatus, setReportStatus] = useState<'idle' | 'success' | 'error' | 'duplicate'>('idle');
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
    const [recognition, setRecognition] = useState<any>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const recognizedTextRef = useRef('');
    const isRecordingRef = useRef(false);
    const hasCheckedAnswerRef = useRef(false);

    useEffect(() => {
        initQuiz();
        setupSpeech();
    }, [searchParams]);

    const setupSpeech = () => {
        // Recognition setup
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recog = new SpeechRecognition();
            recog.lang = 'ja-JP';
            recog.interimResults = true;
            recog.continuous = true;

            recog.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                const text = finalTranscript || interimTranscript;
                setRecognizedText(text);
                recognizedTextRef.current = text;

                // If user already released the button, check if we can verify now
                if (!isRecordingRef.current && text && !hasCheckedAnswerRef.current) {
                    checkAnswer();
                }
            };

            recog.onend = () => {
                // Auto-check when recognition stops
                setIsRecording(false);
                isRecordingRef.current = false;

                // Final attempt to check
                setTimeout(() => {
                    checkAnswer();
                }, 100);
            };

            recog.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsRecording(false);
            };

            setRecognition(recog);
        }

        // Synthesis voices
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            const jaVoices = voices.filter(v => v.lang.startsWith('ja'));
            setAvailableVoices(jaVoices);
            if (jaVoices.length > 0 && !selectedVoiceName) {
                setSelectedVoiceName(jaVoices[0].name);
            }
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    };

    const initQuiz = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/');
            return;
        }

        const { data: profile } = await supabase.from('profiles').select('current_level, preferred_language, daily_goal').eq('id', user.id).single();
        const currentLevel = profile?.current_level || 'N5';
        const goal = profile?.daily_goal || 10;
        const levelNumber = parseInt(currentLevel.replace('N', '')) || 5;
        const difficulty = 6 - levelNumber;

        setPreferredLang(profile?.preferred_language || 'English');

        const mode = searchParams.get('mode');
        const isReview = mode === 'review';
        setIsReviewMode(isReview);

        let questionData: any[] = [];
        const now = new Date().toISOString();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        if (isReview) {
            const { data: dueProgress } = await supabase
                .from('user_pronunciation_progress')
                .select('question_id')
                .eq('user_id', user.id)
                .lte('next_review_at', now);

            const { count: completedToday } = await supabase
                .from('user_pronunciation_progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('last_reviewed_at', todayStart.toISOString())
                .gt('next_review_at', now);

            setReviewedTodayCount(completedToday || 0);
            const dueIds = dueProgress?.map(p => p.question_id) || [];
            setTotalDueToday(dueIds.length + (completedToday || 0));

            if (dueIds.length > 0) {
                const { data } = await supabase
                    .from('pronunciation_questions')
                    .select('*')
                    .eq('difficulty', difficulty)
                    .eq('is_active', true)
                    .in('id', dueIds);
                questionData = data || [];
            }
        } else {
            const { data: learnedProgress } = await supabase
                .from('user_pronunciation_progress')
                .select('question_id')
                .eq('user_id', user.id)
                .gt('correct_count', 0);

            const learnedIds = learnedProgress?.map(p => p.question_id) || [];
            let query = supabase.from('pronunciation_questions').select('*').eq('difficulty', difficulty).eq('is_active', true);
            if (learnedIds.length > 0) {
                query = query.not('id', 'in', `(${learnedIds.join(',')})`);
            }
            const { data } = await query.limit(goal);
            questionData = data || [];
        }

        if (questionData.length > 0) {
            setQuestions(questionData.sort(() => Math.random() - 0.5));
        }

        // Global progress
        const { count: total } = await supabase.from('pronunciation_questions').select('*', { count: 'exact', head: true }).eq('difficulty', difficulty);
        const { count: learned } = await supabase.from('user_pronunciation_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gt('correct_count', 0)
            .in('question_id', (await supabase.from('pronunciation_questions').select('id').eq('difficulty', difficulty)).data?.map(p => p.id) || []);

        setOverallProgress({ learned: learned || 0, total: total || 0 });
        setLoading(false);
        hasCheckedAnswerRef.current = false;
    };

    const updateSRS = async (isCorrect: boolean) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const currentQuestion = questions[currentIdx];
        const { data: existing } = await supabase
            .from('user_pronunciation_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('question_id', currentQuestion.id)
            .single();

        let srs_stage = existing?.srs_stage || 0;
        let ease_factor = existing?.ease_factor || 2.5;
        let interval = existing?.interval || 0;

        if (isCorrect) {
            if (srs_stage === 0) interval = 1;
            else if (srs_stage === 1) interval = 6;
            else interval = Math.round(interval * ease_factor);
            srs_stage++;
            ease_factor = Math.min(2.5, ease_factor + 0.1);
            if (isReviewMode) setReviewedTodayCount(prev => prev + 1);
        } else {
            srs_stage = 1;
            interval = 0;
            ease_factor = Math.max(1.3, ease_factor - 0.2);
        }

        const next_review_at = new Date();
        next_review_at.setDate(next_review_at.getDate() + interval);

        const updateData = {
            user_id: user.id,
            question_id: currentQuestion.id,
            srs_stage,
            ease_factor,
            interval,
            next_review_at: next_review_at.toISOString(),
            last_reviewed_at: new Date().toISOString(),
            [isCorrect ? 'correct_count' : 'incorrect_count']: (existing?.[isCorrect ? 'correct_count' : 'incorrect_count'] || 0) + 1
        };

        if (existing) {
            await supabase.from('user_pronunciation_progress').update(updateData).eq('id', existing.id);
        } else {
            await supabase.from('user_pronunciation_progress').insert(updateData);
        }
    };

    const startRecording = async () => {
        setRecognizedText('');
        recognizedTextRef.current = '';
        hasCheckedAnswerRef.current = false;
        setRecordedBlob(null);
        setIsRecording(true);
        isRecordingRef.current = true;
        chunksRef.current = [];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setRecordedBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            if (recognition) recognition.start();
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        setIsRecording(false);
        isRecordingRef.current = false;
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (recognition) {
            try {
                recognition.stop();
            } catch (e) {
                console.error("Stop recognition failed:", e);
            }
        }

        // If we already have text, try checking immediately
        if (recognizedTextRef.current) {
            checkAnswer();
        }
    };

    const playReference = () => {
        const current = questions[currentIdx];
        if (current.audio_url) {
            if (audioRef.current) {
                audioRef.current.src = current.audio_url;
                audioRef.current.play();
                return;
            }
        }

        // Fallback to TTS
        const utterance = new SpeechSynthesisUtterance(current.sentence);
        utterance.lang = 'ja-JP';
        if (selectedVoiceName) {
            const voice = availableVoices.find(v => v.name === selectedVoiceName);
            if (voice) utterance.voice = voice;
        }
        window.speechSynthesis.speak(utterance);
    };

    const playMyRecording = () => {
        if (recordedBlob) {
            const url = URL.createObjectURL(recordedBlob);
            const audio = new Audio(url);
            audio.play();
        }
    };

    const normalizeText = (text: string) => {
        return text.replace(/[、。！？\s.,!?:;"'「」]/g, '').trim();
    };

    // Helper to align sentence (Kanji) with reading (Kana)
    const getAlignedSegments = (sentence: string, readingStr: string) => {
        const segments: { k: string; r: string; isKanji: boolean }[] = [];
        const reading = readingStr || '';
        let sIdx = 0;
        let rIdx = 0;

        while (sIdx < sentence.length) {
            const char = sentence[sIdx];
            const isKanji = /[\u4e00-\u9faf\u3400-\u4dbf]/.test(char);

            if (isKanji) {
                let kCluster = '';
                while (sIdx < sentence.length && /[\u4e00-\u9faf\u3400-\u4dbf]/.test(sentence[sIdx])) {
                    kCluster += sentence[sIdx];
                    sIdx++;
                }

                let anchor = '';
                if (sIdx < sentence.length) {
                    anchor = sentence[sIdx];
                }

                let rCluster = '';
                if (anchor) {
                    const nextAnchorIdx = reading.indexOf(anchor, rIdx);
                    if (nextAnchorIdx !== -1) {
                        rCluster = reading.substring(rIdx, nextAnchorIdx);
                        rIdx = nextAnchorIdx;
                    } else {
                        rCluster = reading.substring(rIdx);
                        rIdx = reading.length;
                    }
                } else {
                    rCluster = reading.substring(rIdx);
                    rIdx = reading.length;
                }
                segments.push({ k: kCluster, r: rCluster, isKanji: true });
            } else {
                // If it's kana/punctuation, try to find it in reading to stay in sync
                const rCharIdx = reading.indexOf(char, rIdx);
                if (rCharIdx !== -1) {
                    rIdx = rCharIdx + 1;
                }
                segments.push({ k: char, r: char, isKanji: false });
                sIdx++;
            }
        }
        return segments;
    };

    const checkAnswer = () => {
        const text = recognizedTextRef.current;
        if (answered || !text || hasCheckedAnswerRef.current) return;

        hasCheckedAnswerRef.current = true;
        const current = questions[currentIdx];
        const normalizedUser = normalizeText(text);

        const segments = getAlignedSegments(current.sentence, current.reading || '');
        const regexStr = segments
            .map(seg => {
                const k = normalizeText(seg.k);
                const r = normalizeText(seg.r);
                if (!k && !r) return '';
                if (seg.isKanji) return `(${k}|${r})`;
                return k;
            })
            .filter(Boolean)
            .join('');

        const flexibleRegex = new RegExp(`^${regexStr}$`);
        const isCorrect = flexibleRegex.test(normalizedUser) ||
            normalizedUser === normalizeText(current.sentence) ||
            normalizedUser === normalizeText(current.reading || '');

        setAnswered(true);
        updateSRS(isCorrect);

        if (isCorrect) {
            addXP('LISTENING', 5).then(res => {
                if (res) {
                    setLastGainedXP(res.xpGained);
                    setXpNotificationKey(prev => prev + 1);
                }
            });
        }
    };

    const handleNext = () => {
        setCurrentIdx(prev => prev + 1);
        setAnswered(false);
        hasCheckedAnswerRef.current = false;
        setRecognizedText('');
        recognizedTextRef.current = '';
        setRecordedBlob(null);
        setLastGainedXP(null);
    };

    const handleReport = async (reason: 'invalid_question' | 'incorrect_answer') => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setIsReporting(true);
        setReportStatus('idle');

        const { error } = await supabase
            .from('pronunciation_question_reports')
            .insert({
                user_id: user.id,
                question_id: questions[currentIdx].id,
                reason
            });

        if (error) {
            setReportStatus(error.code === '23505' ? 'duplicate' : 'error');
            setTimeout(() => setReportStatus('idle'), 3000);
        } else {
            setReportStatus('success');
            setTimeout(() => {
                setReportStatus('idle');
                setShowReportMenu(false);
                handleNext();
            }, 1500);
        }
        setIsReporting(false);
    };

    const renderDiff = () => {
        const current = questions[currentIdx];
        if (!recognizedText) return <span className="text-ghost-grey opacity-50 italic">Waiting for recording...</span>;

        const segments = getAlignedSegments(current.sentence, current.reading || '');
        let userRemaining = normalizeText(recognizedText);

        return (
            <div className="flex flex-wrap justify-center gap-x-1">
                {segments.map((seg, i) => {
                    const normK = normalizeText(seg.k);
                    const normR = normalizeText(seg.r);

                    if (!normK) return null;

                    let matched = false;
                    let matchLen = 0;

                    if (userRemaining.startsWith(normK)) {
                        matched = true;
                        matchLen = normK.length;
                    } else if (seg.isKanji && userRemaining.startsWith(normR)) {
                        matched = true;
                        matchLen = normR.length;
                    }

                    if (matched) {
                        userRemaining = userRemaining.substring(matchLen);
                        return <span key={i} className="text-emerald-500">{seg.k}</span>;
                    } else {
                        // If it's punctuation in target, just show it normally
                        if (!seg.isKanji && /[、。！？\s.,!?:;"'「」]/.test(seg.k)) {
                            return <span key={i} className="text-charcoal/30 dark:text-white/30">{seg.k}</span>;
                        }
                        return (
                            <span key={i} className="text-rose-500 underline decoration-rose-300 decoration-2 underline-offset-4">
                                {seg.k}
                            </span>
                        );
                    }
                })}
            </div>
        );
    };

    if (loading) return <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6 text-charcoal dark:text-white font-black italic animate-pulse">Initializing Sensei...</div>;

    if (!questions[currentIdx]) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="size-32 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
                        <span className="material-symbols-outlined !text-6xl text-emerald-600 dark:text-emerald-400">task_alt</span>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black text-charcoal dark:text-white tracking-tight">Mission Accomplished!</h2>
                        <p className="text-ghost-grey dark:text-slate-400 font-medium text-lg leading-relaxed">
                            {isReviewMode ? "You've finished your pronunciation session for today." : "You've mastered all pronunciation challenges in this level!"}
                        </p>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="w-full py-5 bg-primary text-white font-black rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const current = questions[currentIdx];

    return (
        <div className="bg-background-light dark:bg-background-dark text-charcoal dark:text-slate-100 min-h-screen flex flex-col font-display transition-colors duration-300">
            <header className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(isReviewMode ? (totalDueToday > 0 ? reviewedTodayCount / totalDueToday : 0) : ((currentIdx + 1) / questions.length)) * 100}%` }}></div>
                </div>
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-ghost-grey hover:text-primary transition-colors font-bold text-sm">
                        <span className="material-symbols-outlined !text-xl">arrow_back</span>
                        <span>Exit</span>
                    </button>
                    <div className="flex flex-col items-center">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-ghost-grey">Pronunciation Practice</div>
                        <div className="text-[10px] font-bold text-primary">
                            {isReviewMode ? `${reviewedTodayCount} / ${totalDueToday}` : `${currentIdx + 1} / ${questions.length}`} items
                        </div>
                    </div>
                    <div className="size-10 flex items-center justify-end relative">
                        {lastGainedXP && (
                            <div key={xpNotificationKey} className="absolute -top-4 right-0 pointer-events-none">
                                <div className="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-amber-500/20 animate-float-up-fade whitespace-nowrap border border-amber-200 dark:border-amber-500/30">
                                    +{lastGainedXP} XP
                                </div>
                            </div>
                        )}
                        <span className="material-symbols-outlined text-primary">mic</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 pt-24">
                <div className="w-full max-w-2xl space-y-12 relative">
                    {/* Report Button & Menu */}
                    <div className="absolute -top-12 right-0 z-20 flex flex-col items-end">
                        <button
                            onClick={() => setShowReportMenu(!showReportMenu)}
                            className={`size-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border transition-all shadow-sm active:scale-95
                                ${showReportMenu ? 'border-primary text-primary' : 'border-black/5 dark:border-white/5 text-rose-500'}`}
                        >
                            <span className="material-symbols-outlined !text-2xl">{showReportMenu ? 'close' : 'report'}</span>
                        </button>
                        {showReportMenu && (
                            <div className="mt-2 w-48 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 flex flex-col gap-1 z-30">
                                <button onClick={() => handleReport('invalid_question')} disabled={isReporting} className="px-4 py-3 text-left text-xs font-black uppercase text-charcoal dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">Invalid Question</button>
                                <button onClick={() => handleReport('incorrect_answer')} disabled={isReporting} className="px-4 py-3 text-left text-xs font-black uppercase text-charcoal dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">Incorrect Answer</button>
                                {reportStatus !== 'idle' && <div className="px-4 py-2 text-[10px] font-bold text-center">{reportStatus === 'success' ? 'Report sent!' : reportStatus === 'duplicate' ? 'Already reported' : 'Error'}</div>}
                            </div>
                        )}
                    </div>

                    <div className="text-center space-y-10">
                        <div className="space-y-4">
                            <p className="text-xl md:text-2xl text-ghost-grey dark:text-gray-400 font-bold leading-snug">
                                {preferredLang === 'Chinese' ? current.translation_zh : current.translation}
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <button onClick={playReference} className="px-6 py-3 rounded-full bg-primary/10 text-primary flex items-center gap-3 transition-all hover:bg-primary/20 active:scale-95 shadow-sm border border-primary/10">
                                    <span className="material-symbols-outlined">volume_up</span>
                                    <span className="text-sm font-black uppercase tracking-widest">Listen Reference</span>
                                </button>
                                {availableVoices.length > 1 && (
                                    <select
                                        value={selectedVoiceName}
                                        onChange={(e) => setSelectedVoiceName(e.target.value)}
                                        className="bg-slate-50 dark:bg-slate-800 border-none rounded-full px-4 py-3 text-xs font-bold text-ghost-grey dark:text-slate-400 focus:ring-1 focus:ring-primary shadow-inner"
                                    >
                                        {availableVoices.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                                    </select>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-5xl md:text-7xl font-black text-charcoal dark:text-white leading-tight tracking-tight">
                                {answered ? current.sentence : renderDiff()}
                            </div>
                            <p className="text-lg font-bold text-ghost-grey dark:text-slate-500 opacity-60">{current.reading}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-black/5 dark:border-white/5 shadow-2xl space-y-8">
                        <div className="flex flex-col items-center gap-6">
                            <button
                                onMouseDown={!answered ? startRecording : undefined}
                                onMouseUp={!answered ? stopRecording : undefined}
                                onTouchStart={!answered ? startRecording : undefined}
                                onTouchEnd={!answered ? stopRecording : undefined}
                                onClick={answered ? playMyRecording : undefined}
                                className={`size-24 rounded-full flex items-center justify-center transition-all shadow-2xl relative
                                    ${isRecording
                                        ? 'bg-rose-500 text-white scale-110 ring-8 ring-rose-500/20'
                                        : answered
                                            ? 'bg-emerald-500 text-white hover:scale-105 active:scale-95'
                                            : 'bg-primary text-white hover:scale-105 active:scale-95'}`}
                            >
                                {isRecording && <div className="absolute inset-0 rounded-full animate-ping bg-rose-500/30"></div>}
                                <span className="material-symbols-outlined !text-4xl">
                                    {isRecording ? 'graphic_eq' : answered ? 'play_arrow' : 'mic'}
                                </span>
                            </button>
                            <p className="text-sm font-black text-ghost-grey dark:text-slate-400 uppercase tracking-[0.2em]">
                                {isRecording ? 'Recording Now...' : answered ? 'Listen to yourself' : 'Hold to record your voice'}
                            </p>
                        </div>

                        {recognizedText && (
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-black/5 dark:border-white/5 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-ghost-grey tracking-widest">Recognized Transcription</span>
                                    {recordedBlob && (
                                        <button onClick={playMyRecording} className="text-primary flex items-center gap-1.5 text-xs font-black">
                                            <span className="material-symbols-outlined !text-sm">play_circle</span>
                                            Playback
                                        </button>
                                    )}
                                </div>
                                <p className="text-2xl font-black text-charcoal dark:text-white leading-relaxed">{recognizedText}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        {answered && (
                            <button
                                onClick={handleNext}
                                className="w-full py-5 bg-primary text-white rounded-3xl font-black text-xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all animate-in slide-in-from-right-4"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </main>
            <audio ref={audioRef} className="hidden" />
        </div>
    );
};

export default PronunciationPage;
