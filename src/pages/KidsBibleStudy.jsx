import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Star, Heart, Sparkles, Trophy, PartyPopper, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

const kidStories = {
  en: [
    {
      title: "Noah's Ark",
      verse: "Genesis 6-9",
      story: "A long time ago, people on Earth were not being nice to each other. God was sad because they forgot about Him. But there was one man named Noah who loved God very much! God told Noah, 'I'm going to send rain to wash the Earth clean. Build a big boat called an ark!' Noah listened and started building. His neighbors laughed at him, but Noah kept working. God told Noah to bring two of every animal onto the ark - elephants, lions, birds, and even tiny bugs! When everyone was safe inside, the rain started. It rained for 40 days and 40 nights! The whole Earth was covered with water, but Noah, his family, and all the animals were safe and dry in the ark. Finally, the rain stopped. Noah sent out a dove, and it came back with a leaf - land was appearing! When they got out, God put a beautiful rainbow in the sky as a promise that He would never flood the whole Earth again.",
      lesson: "God always keeps His promises and protects us.",
      color: "bg-blue-500",
      emoji: "🌈"
    },
    {
      title: "David and Goliath",
      verse: "1 Samuel 17",
      story: "The Israelites were at war with the Philistines. The Philistines had a giant warrior named Goliath who was over 9 feet tall! Every day, Goliath would shout and make fun of God's people. All the soldiers were too scared to fight him. But there was a young shepherd boy named David who came to bring food to his brothers. When David heard Goliath making fun of God, he got brave! 'I'll fight him!' David said. The king tried to give David armor, but it was too heavy. So David went with just his sling and five smooth stones from the river. Goliath laughed when he saw little David. But David said, 'You come with a sword, but I come in the name of the Lord!' David swung his sling and - whoosh! - the stone hit Goliath right in the forehead. The giant fell down! Everyone cheered because David trusted God and won!",
      lesson: "With God's help, we can do anything!",
      color: "bg-green-500",
      emoji: "⚔️"
    },
    {
      title: "Daniel and the Lions",
      verse: "Daniel 6",
      story: "Daniel was a good man who prayed to God three times every day. He worked for the king and did such a great job that some jealous men got mad. They tricked the king into making a new law: 'Nobody can pray to anyone except the king for 30 days!' But Daniel kept praying to God anyway because he loved God more than anything. The jealous men caught Daniel praying and told the king. The king was very sad because he liked Daniel, but he had to follow his own law. So Daniel was thrown into a den full of hungry lions! The king couldn't sleep all night, worried about Daniel. Early in the morning, the king ran to the lions' den and called out, 'Daniel, did your God save you?' And Daniel answered, 'Yes! God sent an angel to close the lions' mouths!' The king was so happy! He made a new law that everyone should respect Daniel's God.",
      lesson: "Always stay faithful to God no matter what.",
      color: "bg-yellow-500",
      emoji: "🦁"
    },
    {
      title: "Jesus Feeds 5000",
      verse: "John 6:1-14",
      story: "One day, thousands of people followed Jesus to hear Him teach about God. They listened all day long and forgot to bring food! The disciples said, 'Jesus, send everyone home to eat.' But Jesus had a different plan. He asked, 'Does anyone have food?' A little boy stepped forward with his lunch - just 5 small loaves of bread and 2 fish. It wasn't much at all! Jesus smiled and thanked God for the food. Then something amazing happened! Jesus started breaking the bread and fish into pieces, and there was more... and more... and more! The disciples passed out the food, and everyone ate until they were full - all 5,000 people! When they collected the leftovers, they filled 12 baskets! Everyone was amazed. The little boy's small lunch became a huge miracle because Jesus blessed it!",
      lesson: "Jesus can do miracles and cares about our needs.",
      color: "bg-purple-500",
      emoji: "🍞"
    },
    {
      title: "The Good Samaritan",
      verse: "Luke 10:25-37",
      story: "Jesus told a story about a man traveling on a road when robbers attacked him! They took his money and hurt him badly, leaving him on the side of the road. Soon, a priest walked by. 'Surely he'll help!' people thought. But the priest looked the other way and kept walking. Then a temple worker came by, but he also ignored the hurt man. Finally, a Samaritan came along. Now, most people didn't like Samaritans back then. But this Samaritan had a kind heart! He stopped, bandaged the man's wounds, put him on his donkey, and took him to an inn. He even paid for the man's room and food! 'Take care of him,' he told the innkeeper, 'and I'll pay you more when I come back.' Jesus asked, 'Who was the real neighbor?' Everyone knew - it was the one who showed kindness!",
      lesson: "Be kind and help others, even strangers!",
      color: "bg-pink-500",
      emoji: "❤️"
    },
    {
      title: "Jonah and the Big Fish",
      verse: "Jonah 1-4",
      story: "God told Jonah, 'Go to the city of Nineveh and tell the people to stop being mean.' But Jonah didn't want to go! He ran away and got on a boat going the opposite direction. God sent a huge storm! The sailors were scared and asked Jonah, 'What did you do?' Jonah said, 'Throw me into the sea - this storm is because of me!' They threw Jonah overboard, and the storm stopped. But God wasn't done with Jonah! He sent a giant fish to swallow Jonah - gulp! Jonah was inside the fish for three days and three nights. He prayed to God, 'I'm sorry! I'll obey you!' The fish spit Jonah out onto the beach. This time, Jonah went to Nineveh and told everyone about God. The people listened and changed their ways. Jonah learned that God loves everyone and gives second chances!",
      lesson: "God gives us second chances and loves all people.",
      color: "bg-cyan-500",
      emoji: "🐋"
    }
  ],
  es: [
    {
      title: "El Arca de Noé",
      verse: "Génesis 6-9",
      story: "Hace mucho tiempo, la gente en la Tierra no se trataba bien. Dios estaba triste porque se olvidaron de Él. Pero había un hombre llamado Noé que amaba mucho a Dios. Dios le dijo a Noé: '¡Voy a enviar lluvia para limpiar la Tierra. Construye un gran barco llamado arca!' Noé escuchó y comenzó a construir. Sus vecinos se reían de él, pero Noé siguió trabajando. Dios le dijo a Noé que trajera dos de cada animal al arca: ¡elefantes, leones, pájaros e incluso insectos pequeños! Cuando todos estaban a salvo adentro, comenzó la lluvia. ¡Llovió durante 40 días y 40 noches! Toda la Tierra estaba cubierta de agua, pero Noé, su familia y todos los animales estaban seguros y secos en el arca. Finalmente, la lluvia se detuvo. Noé envió una paloma y regresó con una hoja: ¡la tierra estaba apareciendo! Cuando salieron, Dios puso un hermoso arcoíris en el cielo como promesa de que nunca volvería a inundar toda la Tierra.",
      lesson: "Dios siempre cumple Sus promesas y nos protege.",
      color: "bg-blue-500",
      emoji: "🌈"
    },
    {
      title: "David y Goliat",
      verse: "1 Samuel 17",
      story: "Los israelitas estaban en guerra con los filisteos. Los filisteos tenían un guerrero gigante llamado Goliat que medía más de 9 pies de alto. Todos los días, Goliat gritaba y se burlaba del pueblo de Dios. Todos los soldados tenían demasiado miedo para luchar contra él. Pero había un joven pastor llamado David que vino a traer comida a sus hermanos. Cuando David escuchó a Goliat burlándose de Dios, ¡se volvió valiente! '¡Yo pelearé contra él!' dijo David. El rey trató de darle armadura a David, pero era demasiado pesada. Así que David fue con solo su honda y cinco piedras lisas del río. Goliat se rió cuando vio al pequeño David. Pero David dijo: '¡Tú vienes con espada, pero yo vengo en el nombre del Señor!' David giró su honda y - ¡whoosh! - la piedra golpeó a Goliat justo en la frente. ¡El gigante cayó! Todos vitorearon porque David confió en Dios y ganó.",
      lesson: "¡Con la ayuda de Dios, podemos hacer cualquier cosa!",
      color: "bg-green-500",
      emoji: "⚔️"
    },
    {
      title: "Daniel y los Leones",
      verse: "Daniel 6",
      story: "Daniel era un buen hombre que oraba a Dios tres veces al día. Trabajaba para el rey e hizo un trabajo tan bueno que algunos hombres celosos se enojaron. Engañaron al rey para hacer una nueva ley: '¡Nadie puede orar a nadie excepto al rey durante 30 días!' Pero Daniel siguió orando a Dios de todos modos porque amaba a Dios más que nada. Los hombres celosos atraparon a Daniel orando y se lo dijeron al rey. El rey estaba muy triste porque le gustaba Daniel, pero tenía que seguir su propia ley. ¡Así que Daniel fue arrojado a un foso lleno de leones hambrientos! El rey no pudo dormir en toda la noche, preocupado por Daniel. Temprano en la mañana, el rey corrió al foso de los leones y gritó: 'Daniel, ¿te salvó tu Dios?' Y Daniel respondió: '¡Sí! ¡Dios envió un ángel para cerrar las bocas de los leones!' ¡El rey estaba tan feliz! Hizo una nueva ley de que todos debían respetar al Dios de Daniel.",
      lesson: "Mantente siempre fiel a Dios sin importar qué.",
      color: "bg-yellow-500",
      emoji: "🦁"
    },
    {
      title: "Jesús Alimenta a 5000",
      verse: "Juan 6:1-14",
      story: "Un día, miles de personas siguieron a Jesús para escucharlo enseñar sobre Dios. ¡Escucharon todo el día y se olvidaron de traer comida! Los discípulos dijeron: 'Jesús, envía a todos a casa a comer.' Pero Jesús tenía un plan diferente. Preguntó: '¿Alguien tiene comida?' Un niño pequeño se adelantó con su almuerzo: solo 5 panes pequeños y 2 peces. ¡No era mucho! Jesús sonrió y agradeció a Dios por la comida. ¡Entonces sucedió algo increíble! Jesús comenzó a partir el pan y los peces en pedazos, y había más... y más... y más. Los discípulos repartieron la comida y todos comieron hasta estar llenos, ¡todas las 5,000 personas! Cuando recogieron las sobras, ¡llenaron 12 canastas! Todos estaban asombrados. ¡El pequeño almuerzo del niño se convirtió en un gran milagro porque Jesús lo bendijo!",
      lesson: "Jesús puede hacer milagros y se preocupa por nuestras necesidades.",
      color: "bg-purple-500",
      emoji: "🍞"
    },
    {
      title: "El Buen Samaritano",
      verse: "Lucas 10:25-37",
      story: "Jesús contó una historia sobre un hombre que viajaba por un camino cuando ¡los ladrones lo atacaron! Le quitaron su dinero y lo lastimaron gravemente, dejándolo al lado del camino. Pronto, pasó un sacerdote. '¡Seguramente él ayudará!' pensó la gente. Pero el sacerdote miró hacia otro lado y siguió caminando. Luego vino un trabajador del templo, pero también ignoró al hombre herido. Finalmente, vino un samaritano. Ahora, a la mayoría de la gente no le gustaban los samaritanos en ese entonces. ¡Pero este samaritano tenía un corazón amable! Se detuvo, vendó las heridas del hombre, lo puso en su burro y lo llevó a una posada. ¡Incluso pagó por la habitación y la comida del hombre! 'Cuídalo', le dijo al posadero, 'y te pagaré más cuando regrese'. Jesús preguntó: '¿Quién fue el verdadero vecino?' Todos sabían: ¡fue el que mostró bondad!",
      lesson: "¡Sé amable y ayuda a los demás, incluso a extraños!",
      color: "bg-pink-500",
      emoji: "❤️"
    },
    {
      title: "Jonás y el Gran Pez",
      verse: "Jonás 1-4",
      story: "Dios le dijo a Jonás: 'Ve a la ciudad de Nínive y dile a la gente que deje de ser mala'. ¡Pero Jonás no quería ir! Huyó y se subió a un barco que iba en dirección opuesta. ¡Dios envió una gran tormenta! Los marineros estaban asustados y le preguntaron a Jonás: '¿Qué hiciste?' Jonás dijo: '¡Tírenme al mar, esta tormenta es por mi culpa!' Lo arrojaron por la borda y la tormenta se detuvo. ¡Pero Dios no había terminado con Jonás! Envió un pez gigante para tragar a Jonás: ¡gulp! Jonás estuvo dentro del pez durante tres días y tres noches. Oró a Dios: '¡Lo siento! ¡Te obedeceré!' El pez escupió a Jonás en la playa. Esta vez, Jonás fue a Nínive y le contó a todos sobre Dios. La gente escuchó y cambió sus caminos. ¡Jonás aprendió que Dios ama a todos y da segundas oportunidades!",
      lesson: "Dios nos da segundas oportunidades y ama a todas las personas.",
      color: "bg-cyan-500",
      emoji: "🐋"
    }
  ]
};

const funActivities = {
  en: [
    { title: "Memory Verse Game", icon: Brain, color: "bg-orange-500" },
    { title: "Bible Story Coloring", icon: Sparkles, color: "bg-indigo-500" },
    { title: "Song Time", icon: PartyPopper, color: "bg-rose-500" },
    { title: "Prayer Challenges", icon: Heart, color: "bg-red-500" }
  ],
  es: [
    { title: "Juego de Memorizar Versículos", icon: Brain, color: "bg-orange-500" },
    { title: "Colorear Historias Bíblicas", icon: Sparkles, color: "bg-indigo-500" },
    { title: "Tiempo de Canciones", icon: PartyPopper, color: "bg-rose-500" },
    { title: "Desafíos de Oración", icon: Heart, color: "bg-red-500" }
  ]
};

const translations = {
  en: {
    title: "Kids Bible Study! 🌟",
    subtitle: "Learn Amazing Stories from the Bible!",
    points: "Points!",
    readStory: "Read Story!",
    theStory: "The Story:",
    whatWeLearn: "What We Learn:",
    listen: "Read Story to Me! 📖",
    stopListening: "Stop Reading",
    loadingAudio: "Loading Audio...",
    iReadIt: "I Finished! (+10 Points)",
    close: "Close",
    comingSoon: "Coming Soon: Fun Activities!",
    encouragement: "🎉 You're Doing Great! 🎉",
    keepLearning: "Keep learning about Jesus and God's amazing love!"
  },
  es: {
    title: "¡Estudio Bíblico para Niños! 🌟",
    subtitle: "¡Aprende Historias Increíbles de la Biblia!",
    points: "¡Puntos!",
    readStory: "¡Leer Historia!",
    theStory: "La Historia:",
    whatWeLearn: "Lo que Aprendemos:",
    listen: "¡Léeme la Historia! 📖",
    stopListening: "Dejar de Leer",
    loadingAudio: "Cargando Audio...",
    iReadIt: "¡Terminé! (+10 Puntos)",
    close: "Cerrar",
    comingSoon: "¡Próximamente: Actividades Divertidas!",
    encouragement: "🎉 ¡Lo Estás Haciendo Genial! 🎉",
    keepLearning: "¡Sigue aprendiendo sobre Jesús y el amor increíble de Dios!"
  }
};

export default function KidsBibleStudy() {
  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get('lang') || 'en';
  const t = translations[lang];
  const stories = kidStories[lang];
  const activities = funActivities[lang];

  const [selectedStory, setSelectedStory] = useState(null);
  const [points, setPoints] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedStory) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      window.speechSynthesis.cancel();
      setIsReading(false);
    }
  }, [selectedStory]);

  const handleStoryComplete = () => {
    setPoints(points + 10);
    setSelectedStory(null);
    setAudioUrl(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsReading(false);
  };

  const handleListen = (story) => {
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    const textToRead = `${story.title}. ${story.story}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.85;
    utterance.pitch = 1.5; // Higher pitch for child-like voice

    const voices = window.speechSynthesis.getVoices();

    if (lang === 'en') {
      // Try to find a female/child voice for English
      const kidVoice = voices.find(v => 
        v.name.includes('Google UK English Female') || 
        v.name.includes('Microsoft Zira') ||
        v.name.includes('Female') ||
        v.name.includes('Samantha')
      );
      if (kidVoice) {
        utterance.voice = kidVoice;
      }
    } else {
      // Try to find a female/child voice for Spanish
      const kidVoice = voices.find(v => 
        v.lang.startsWith('es') && (
          v.name.includes('Female') ||
          v.name.includes('Mónica') ||
          v.name.includes('Paulina') ||
          v.name.includes('Google español') ||
          v.name.includes('Microsoft Helena')
        )
      );
      if (kidVoice) {
        utterance.voice = kidVoice;
      }
    }
    
    utterance.onend = () => setIsReading(false);
    window.speechSynthesis.speak(utterance);
    setIsReading(true);
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
            {t.title}
          </span>
        </h1>
        <p className="text-2xl text-blue-400 font-semibold">
          {t.subtitle}
        </p>
        
        {/* Points Badge */}
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg">
          <Trophy className="h-6 w-6 text-white" />
          <span className="text-white font-bold text-xl">{points} {t.points}</span>
          <Star className="h-6 w-6 text-white" />
        </div>
      </motion.div>

      {/* Bible Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story, idx) => (
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
                  {t.readStory}
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
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
            window.speechSynthesis.cancel();
            setIsReading(false);
            setSelectedStory(null);
          }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
          >
            <div className="p-8 pb-4 text-center">
              <div className="text-7xl mb-4">{selectedStory.emoji}</div>
              <h2 className="text-4xl font-bold text-slate-800 mb-2">
                {selectedStory.title}
              </h2>
              <p className="text-lg text-slate-600 font-medium">{selectedStory.verse}</p>
            </div>

            <div className="px-8 flex-1 overflow-y-auto">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-300 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {t.theStory}
                  </h3>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    {selectedStory.story}
                  </p>
                </div>

                <div className="bg-yellow-100 rounded-lg p-4 border-2 border-yellow-400">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    {t.whatWeLearn}
                  </h3>
                  <p className="text-lg text-slate-700 font-medium">
                    {selectedStory.lesson}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 pt-4 flex gap-3">
              <Button
                onClick={() => handleListen(selectedStory)}
                disabled={loadingAudio}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold text-lg py-6"
              >
                {loadingAudio ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {t.loadingAudio}
                  </>
                ) : isReading ? (
                  <>
                    <VolumeX className="h-5 w-5 mr-2" />
                    {t.stopListening}
                  </>
                ) : (
                  <>
                    <Volume2 className="h-5 w-5 mr-2" />
                    {t.listen}
                  </>
                )}
              </Button>
              <Button
                onClick={handleStoryComplete}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg py-6"
              >
                <Star className="h-5 w-5 mr-2" />
                {t.iReadIt}
              </Button>
              <Button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                  }
                  window.speechSynthesis.cancel();
                  setIsReading(false);
                  setSelectedStory(null);
                }}
                variant="outline"
                className="border-2 border-slate-300"
              >
                {t.close}
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
            {t.comingSoon}
            <Sparkles className="h-8 w-8" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {activities.map((activity, idx) => (
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
            {t.encouragement}
          </h3>
          <p className="text-xl text-white font-medium">
            {t.keepLearning}
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