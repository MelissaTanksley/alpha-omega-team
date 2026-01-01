import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Star, Heart, Sparkles, Trophy, PartyPopper, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

const kidStories = [
  {
    title: "Noah's Ark",
    verse: "Genesis 6-9",
    summary: "God told Noah to build a big boat to save animals from a flood!",
    lesson: "God always keeps His promises and protects us.",
    color: "bg-blue-500",
    emoji: "🌈"
  },
  {
    title: "David and Goliath",
    verse: "1 Samuel 17",
    summary: "Young David defeated the giant Goliath with just a sling and stones!",
    lesson: "With God's help, we can do anything!",
    color: "bg-green-500",
    emoji: "⚔️"
  },
  {
    title: "Daniel and the Lions",
    verse: "Daniel 6",
    summary: "Daniel prayed to God even when it was dangerous, and God saved him from lions!",
    lesson: "Always stay faithful to God no matter what.",
    color: "bg-yellow-500",
    emoji: "🦁"
  },
  {
    title: "Jesus Feeds 5000",
    verse: "John 6:1-14",
    summary: "Jesus fed thousands of people with just 5 loaves and 2 fish!",
    lesson: "Jesus can do miracles and cares about our needs.",
    color: "bg-purple-500",
    emoji: "🍞"
  },
  {
    title: "The Good Samaritan",
    verse: "Luke 10:25-37",
    summary: "A kind man helped someone who was hurt, even though others passed by.",
    lesson: "Be kind and help others, even strangers!",
    color: "bg-pink-500",
    emoji: "❤️"
  },
  {
    title: "Jonah and the Big Fish",
    verse: "Jonah 1-4",
    summary: "Jonah ran away from God but learned that God loves everyone!",
    lesson: "God gives us second chances and loves all people.",
    color: "bg-cyan-500",
    emoji: "🐋"
  }
];

const funActivities = [
  { title: "Memory Verse Game", icon: Brain, color: "bg-orange-500" },
  { title: "Bible Story Coloring", icon: Sparkles, color: "bg-indigo-500" },
  { title: "Song Time", icon: PartyPopper, color: "bg-rose-500" },
  { title: "Prayer Challenges", icon: Heart, color: "bg-red-500" }
];

export default function KidsBibleStudy() {
  const [selectedStory, setSelectedStory] = useState(null);
  const [points, setPoints] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioRef] = useState(new Audio());

  const handleStoryComplete = () => {
    setPoints(points + 10);
    setSelectedStory(null);
    setAudioUrl(null);
    if (audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
    }
  };

  const handleListen = async (story) => {
    if (isReading && audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
      setIsReading(false);
      return;
    }

    setLoadingAudio(true);
    
    try {
      const { data } = await base44.functions.invoke('readBibleVerses', {
        passage: story.verse
      });

      if (data.audio_url) {
        audioRef.src = data.audio_url;
        audioRef.onended = () => setIsReading(false);
        audioRef.play();
        setIsReading(true);
        setAudioUrl(data.audio_url);
      } else {
        // Fallback to browser speech if no audio URL
        const text = data.text || story.summary;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85;
        utterance.pitch = 1.2;
        utterance.onend = () => setIsReading(false);
        window.speechSynthesis.speak(utterance);
        setIsReading(true);
      }
    } catch (error) {
      console.error('Error fetching audio:', error);
      alert('Could not load audio. Please try again!');
    }
    
    setLoadingAudio(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-5xl font-bold">
          <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Kids Bible Study! 🌟
          </span>
        </h1>
        <p className="text-2xl text-blue-400 font-semibold">
          Learn Amazing Stories from the Bible!
        </p>
        
        {/* Points Badge */}
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg">
          <Trophy className="h-6 w-6 text-white" />
          <span className="text-white font-bold text-xl">{points} Points!</span>
          <Star className="h-6 w-6 text-white" />
        </div>
      </motion.div>

      {/* Bible Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kidStories.map((story, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card 
              className={`${story.color} border-0 shadow-xl cursor-pointer hover:shadow-2xl transition-all`}
              onClick={() => setSelectedStory(story)}
            >
              <CardContent className="p-6 text-center space-y-3">
                <div className="text-6xl mb-3">{story.emoji}</div>
                <h3 className="text-2xl font-bold text-white">{story.title}</h3>
                <p className="text-white/90 text-sm font-medium">{story.verse}</p>
                <Button className="bg-white text-slate-800 hover:bg-slate-100 font-bold">
                  Read Story!
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Story Detail Modal */}
      {selectedStory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedStory(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full p-8 space-y-6"
          >
            <div className="text-center">
              <div className="text-7xl mb-4">{selectedStory.emoji}</div>
              <h2 className="text-4xl font-bold text-slate-800 mb-2">
                {selectedStory.title}
              </h2>
              <p className="text-lg text-slate-600 font-medium">{selectedStory.verse}</p>
            </div>

            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-300">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    The Story:
                  </h3>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    {selectedStory.summary}
                  </p>
                </div>

                <div className="bg-yellow-100 rounded-lg p-4 border-2 border-yellow-400">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    What We Learn:
                  </h3>
                  <p className="text-lg text-slate-700 font-medium">
                    {selectedStory.lesson}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={() => handleListen(selectedStory)}
                disabled={loadingAudio}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold text-lg py-6"
              >
                {loadingAudio ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Loading Audio...
                  </>
                ) : isReading ? (
                  <>
                    <VolumeX className="h-5 w-5 mr-2" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Volume2 className="h-5 w-5 mr-2" />
                    Listen to Bible Verses! 🎧
                  </>
                )}
              </Button>
              <Button
                onClick={handleStoryComplete}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg py-6"
              >
                <Star className="h-5 w-5 mr-2" />
                I Read It! (+10 Points)
              </Button>
              <Button
                onClick={() => setSelectedStory(null)}
                variant="outline"
                className="border-2 border-slate-300"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Fun Activities */}
      <Card className="bg-gradient-to-br from-pink-100 to-purple-100 border-4 border-purple-400 shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl text-center text-purple-800 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8" />
            Coming Soon: Fun Activities!
            <Sparkles className="h-8 w-8" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {funActivities.map((activity, idx) => (
              <div
                key={idx}
                className={`${activity.color} rounded-xl p-4 text-center text-white shadow-lg`}
              >
                <activity.icon className="h-8 w-8 mx-auto mb-2" />
                <p className="font-bold">{activity.title}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Encouragement */}
      <Card className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-3">
            🎉 You're Doing Great! 🎉
          </h3>
          <p className="text-xl text-white font-medium">
            Keep learning about Jesus and God's amazing love!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Brain({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 1.74.63 3.34 1.67 4.59L5 19l2 1 1-3h8l1 3 2-1-1.67-5.41C18.37 12.34 19 10.74 19 9c0-3.87-3.13-7-7-7z"/>
    </svg>
  );
}