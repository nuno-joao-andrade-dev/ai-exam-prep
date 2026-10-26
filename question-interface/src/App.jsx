import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ExamQuestionView } from './components/ExamQuestionView';
import { RubricScorecardView } from './components/RubricScorecardView';
import { SocraticChatView } from './components/SocraticChatView';
import { CurriculumSearchView } from './components/CurriculumSearchView';
import { getAreaDefault } from './sampleData';

function getInitialAreaFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('area') || 'javascript';
}

function getInitialContentFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('content') || '';
}

export function App() {
  const [area, setArea] = useState(getInitialAreaFromUrl);
  const [areas, setAreas] = useState(['javascript', 'ai-agents', 'cloud']);
  const [customContent, setCustomContent] = useState(getInitialContentFromUrl);
  const [showCustomParamBox, setShowCustomParamBox] = useState(
    Boolean(getInitialContentFromUrl())
  );

  const areaDefault = getAreaDefault(area);

  const [status, setStatus] = useState(null);
  const [topic, setTopic] = useState(areaDefault.defaultTopic);
  const [exam, setExam] = useState(areaDefault.exam);
  const [studentAnswer, setStudentAnswer] = useState(areaDefault.sampleAnswer);
  const [evaluation, setEvaluation] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGrading, setIsGrading] = useState(false);

  const [sessionId, setSessionId] = useState(`session-${Date.now()}`);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: `Hello! I am your **Socratic Study Mentor** for \`data/${area}/\`. Ask me for a hint on the exam question or any concept in \`data/${area}/\`, and I will guide you step-by-step without spoiling the answer.`,
    },
  ]);
  const [isSendingChat, setIsSendingChat] = useState(false);

  const [searchQuery, setSearchQuery] = useState(areaDefault.defaultSearchQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sync area parameter to URL (?area=...) and load defaults when area changes
  const handleSelectArea = (nextArea) => {
    setArea(nextArea);
    const url = new URL(window.location.href);
    url.searchParams.set('area', nextArea);
    window.history.replaceState({}, '', url.toString());

    const nextDefault = getAreaDefault(nextArea);
    setTopic(nextDefault.defaultTopic);
    setExam(nextDefault.exam);
    setStudentAnswer(nextDefault.sampleAnswer);
    setEvaluation(null);
    setSearchQuery(nextDefault.defaultSearchQuery);
    setMessages([
      {
        role: 'model',
        text: `Switched area parameter to \`data/${nextArea}/\`. Ask me for a hint on **${nextDefault.exam.examTitle}**!`,
      },
    ]);
  };

  useEffect(() => {
    async function loadStatusAndSearch() {
      try {
        const res = await fetch(`/api/status?area=${encodeURIComponent(area)}`);
        const data = await res.json();
        setStatus(data);
        if (Array.isArray(data.areas) && data.areas.length > 0) {
          setAreas(data.areas);
        }
      } catch {
        setStatus({ ollamaReachable: false, configuredModel: 'gemma4:e2b' });
      }

      try {
        const defaultQuery = getAreaDefault(area).defaultSearchQuery;
        const ragRes = await fetch('/api/rag/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            area,
            query: defaultQuery,
            topK: 3,
            customContent: customContent || undefined,
          }),
        });
        const ragData = await ragRes.json();
        if (ragData.results) setSearchResults(ragData.results);
      } catch {
        // Ignore offline initial search error
      }
    }
    loadStatusAndSearch();
  }, [area, customContent]);

  const handleGenerateExam = async () => {
    setIsGenerating(true);
    setEvaluation(null);
    try {
      const res = await fetch('/api/exam/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area,
          topic,
          customContent: customContent || undefined,
        }),
      });
      const data = await res.json();
      if (data.exam) {
        setExam(data.exam);
      }
    } catch (err) {
      console.error('Exam generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGradeAnswer = async () => {
    setIsGrading(true);
    try {
      const res = await fetch('/api/grade/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area,
          exam,
          studentAnswer,
          customContent: customContent || undefined,
        }),
      });
      const data = await res.json();
      if (data.evaluation) {
        setEvaluation(data.evaluation);
      }
    } catch (err) {
      console.error('Grading error:', err);
    } finally {
      setIsGrading(false);
    }
  };

  const handleSendChatMessage = async (userMessage) => {
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsSendingChat(true);
    try {
      const res = await fetch('/api/socratic/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          area,
          message: userMessage,
          questionContext: `${exam.examTitle}: ${exam.questionPrompt}`,
          customContent: customContent || undefined,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: data.reply || 'No response received from Socratic Mentor.',
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: `Error contacting Socratic Mentor: ${String(err)}` },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleSearchArea = async () => {
    setIsSearching(true);
    try {
      const res = await fetch('/api/rag/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area,
          query: searchQuery,
          topK: 4,
          customContent: customContent || undefined,
        }),
      });
      const data = await res.json();
      if (data.results) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header
        status={status}
        area={area}
        areas={areas}
        onSelectArea={handleSelectArea}
        customContent={customContent}
        onChangeCustomContent={setCustomContent}
        showCustomParamBox={showCustomParamBox}
        onToggleCustomParamBox={() => setShowCustomParamBox((v) => !v)}
      />

      <main className="mx-auto max-w-[1600px] px-6 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Exam Generator, Question Markdown Preview & Student Answer + Rubric */}
          <div className="space-y-6 lg:col-span-7">
            <ExamQuestionView
              area={area}
              exam={exam}
              topic={topic}
              onChangeTopic={setTopic}
              onGenerateExam={handleGenerateExam}
              isGenerating={isGenerating}
              studentAnswer={studentAnswer}
              onChangeStudentAnswer={setStudentAnswer}
              onGradeAnswer={handleGradeAnswer}
              isGrading={isGrading}
              onLoadSampleAnswer={() =>
                setStudentAnswer(getAreaDefault(area).sampleAnswer)
              }
            />

            <RubricScorecardView
              rubric={exam.rubric}
              evaluation={evaluation}
              isGrading={isGrading}
            />
          </div>

          {/* Right Column: Socratic Mentor Chat + Area RAG Search */}
          <div className="space-y-6 lg:col-span-5">
            <SocraticChatView
              area={area}
              messages={messages}
              onSendMessage={handleSendChatMessage}
              isSending={isSendingChat}
              onResetSession={() => {
                setSessionId(`session-${Date.now()}`);
                setMessages([
                  {
                    role: 'model',
                    text: `Session reset! Ask me for a hint about \`data/${area}/\`.`,
                  },
                ]);
              }}
            />

            <CurriculumSearchView
              area={area}
              files={status?.files || []}
              query={searchQuery}
              onChangeQuery={setSearchQuery}
              onSearch={handleSearchArea}
              results={searchResults}
              isSearching={isSearching}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
