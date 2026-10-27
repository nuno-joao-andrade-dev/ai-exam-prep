import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AreaSelectorHero } from './components/AreaSelectorHero';
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
  const [questionDeck, setQuestionDeck] = useState(
    areaDefault.questionDeck || [areaDefault.exam]
  );
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState(areaDefault.sampleAnswer);
  const [evaluation, setEvaluation] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGrading, setIsGrading] = useState(false);

  const [sessionId, setSessionId] = useState(`session-${Date.now()}`);
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: `Welcome to the **IADE AI Exam Prep Portal (Step 06)** for \`data/${area}/\`! Select a question or generate a new one via the **Step 05 API**, write your answer, or ask me for a Socratic hint.`,
    },
  ]);
  const [isSendingChat, setIsSendingChat] = useState(false);

  const [searchQuery, setSearchQuery] = useState(areaDefault.defaultSearchQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const currentExam =
    questionDeck[activeQuestionIndex] || questionDeck[0] || areaDefault.exam;

  // Switch active study area (`data/[area]`) and load its questions
  const handleSelectArea = (nextArea) => {
    setArea(nextArea);
    const url = new URL(window.location.href);
    url.searchParams.set('area', nextArea);
    window.history.replaceState({}, '', url.toString());

    const nextDefault = getAreaDefault(nextArea);
    const nextDeck = nextDefault.questionDeck || [nextDefault.exam];
    setTopic(nextDefault.defaultTopic);
    setQuestionDeck(nextDeck);
    setActiveQuestionIndex(0);
    setStudentAnswer(nextDefault.sampleAnswer);
    setEvaluation(null);
    setSearchQuery(nextDefault.defaultSearchQuery);
    setMessages([
      {
        role: 'model',
        text: `Switched study area to **${nextDefault.label}** (\`data/${nextArea}/\`). **${nextDeck.length} questions** are ready in your deck, or click **Generate Question via API** to synthesize a fresh one with Gemma 4!`,
      },
    ]);
  };

  const handleSelectQuestionIndex = (idx) => {
    setActiveQuestionIndex(idx);
    setEvaluation(null);
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

  const handleGenerateExam = async (customTopic) => {
    const targetTopic = typeof customTopic === 'string' && customTopic.trim() ? customTopic : topic;
    setIsGenerating(true);
    setEvaluation(null);
    try {
      const res = await fetch('/api/exam/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area,
          topic: targetTopic,
          customContent: customContent || undefined,
        }),
      });
      const data = await res.json();
      if (data.exam) {
        setQuestionDeck((prev) => {
          const updated = [
            ...prev,
            {
              ...data.exam,
              area,
              questionNumber: prev.length + 1,
            },
          ];
          setActiveQuestionIndex(updated.length - 1);
          return updated;
        });
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
          exam: currentExam,
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
          questionContext: `${currentExam.examTitle}: ${currentExam.questionPrompt}`,
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
        {
          role: 'model',
          text: `Error contacting Step 05 API Socratic Mentor: ${String(err)}`,
        },
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
    <div>
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

      <AreaSelectorHero
        area={area}
        areas={areas}
        onSelectArea={handleSelectArea}
        onGenerateExam={handleGenerateExam}
        isGenerating={isGenerating}
        questionCount={questionDeck.length}
      />

      <main className="iade-main">
        <div className="iade-workspace-grid">
          {/* Left Column: Area Questions, Student Answer Submission & Step 05 Rubric Scorecard */}
          <div className="iade-col">
            <ExamQuestionView
              area={area}
              exam={currentExam}
              questionDeck={questionDeck}
              activeQuestionIndex={activeQuestionIndex}
              onSelectQuestionIndex={handleSelectQuestionIndex}
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
              rubric={currentExam.rubric}
              evaluation={evaluation}
              isGrading={isGrading}
            />
          </div>

          {/* Right Column: Step 04 Socratic Study Coach + Step 02 Area RAG Explorer */}
          <div className="iade-col">
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
                    text: `Session reset! Ask me for a Socratic hint on **${currentExam.examTitle}** (\`data/${area}/\`).`,
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

      <footer className="iade-footer">
        <div className="iade-footer-inner">
          <div>
            <strong>IADE • Faculdade de Design, Tecnologia e Comunicação</strong> — Step 06 (Optional) React Student Web Interface
          </div>
          <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
            <a
              href="http://localhost:3000/"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--brand2)', fontWeight: 700 }}
            >
              Step 05 OpenAPI / Swagger (:3000)
            </a>
            <a
              href="https://www.iade.europeia.pt/"
              target="_blank"
              rel="noreferrer"
            >
              iade.europeia.pt
            </a>
            <a
              href="https://github.com/nuno-joao-andrade-dev/ai-exam-prep"
              target="_blank"
              rel="noreferrer"
            >
              GitHub Repo
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
