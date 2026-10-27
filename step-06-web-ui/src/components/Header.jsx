import React from 'react';
import { MarkdownBox } from './MarkdownPreview';
import { getAreaDefault } from '../sampleData';

export function IadeLogoSvg() {
  return (
    <svg
      className="iade-logo-svg"
      width="220"
      height="42"
      viewBox="0 0 354 68"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="IADE Faculdade de Design, Tecnologia e Comunicação"
    >
      <path d="M131.73 22.5555L122.946 35.2592H131.73V22.5555Z" fill="black" />
      <path
        d="M138.36 17.2222V50.8148C147.439 49.4259 154.363 42.463 154.363 34.037C154.363 25.6111 147.439 18.6111 138.36 17.2222Z"
        fill="black"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 68V0H233L186.15 68H0ZM180.367 10.9074V17.6667H167.034V30.3518H175.91V37H167.034V50.2778H180.404V56.9259H160.404V39.2407C157.826 49.8333 147.421 57.7778 135.063 57.7778H131.748V41.9815H118.342L108.01 56.8889H102.743V14.5L109.355 10.9629V43.2407L127.181 17.4629C125.248 17.7407 123.535 18.0741 122.08 18.5185L118.912 19.4629L117.016 13.0741L120.183 12.1296C124.069 10.9815 129.465 10.2963 135.045 10.2963C147.421 10.2963 157.789 18.2407 160.385 28.8333V10.9074H180.367Z"
        fill="black"
      />
      <text
        x="232"
        y="29"
        fill="#000000"
        fontFamily="Lato, sans-serif"
        fontWeight="900"
        fontSize="18"
        letterSpacing="1.5"
      >
        CREATIVE
      </text>
      <text
        x="232"
        y="52"
        fill="#000000"
        fontFamily="Lato, sans-serif"
        fontWeight="400"
        fontSize="16.5"
        letterSpacing="1.2"
      >
        UNIVERSITY
      </text>
    </svg>
  );
}

export function Header({
  status,
  area,
  areas,
  onSelectArea,
  customContent,
  onChangeCustomContent,
  showCustomParamBox,
  onToggleCustomParamBox,
}) {
  const areaList = areas?.length ? areas : ['javascript', 'ai-agents', 'cloud'];

  return (
    <div className="iade-navbar-wrapper">
      {/* Top IADE Utility Strip */}
      <div className="iade-utility-bar">
        <div className="iade-utility-inner">
          <ul className="iade-utility-links">
            <li>
              <a
                href="https://www.iade.europeia.pt/"
                target="_blank"
                rel="noreferrer"
              >
                IADE • Faculdade de Design, Tecnologia e Comunicação
              </a>
            </li>
            <li>
              <a href="http://localhost:3000/" target="_blank" rel="noreferrer">
                Step 05 OpenAPI / Swagger (:3000)
              </a>
            </li>
            <li>
              <a href="http://localhost:3030/" target="_blank" rel="noreferrer">
                Workshop Slides (:3030)
              </a>
            </li>
          </ul>

          <div className="iade-utility-right">
            <div className="iade-status-pill" title="Step 05 Express API + Local Ollama">
              <span
                className={`iade-status-dot ${
                  status?.ollamaReachable ? 'online' : 'offline'
                }`}
              />
              <span>
                {status?.ollamaReachable
                  ? 'Step 05 API + Ollama Online'
                  : 'Step 05 API Connected (Ollama Check)'}
              </span>
              <code
                style={{
                  background: 'var(--ui18)',
                  color: 'var(--brand3)',
                  padding: '1px 6px',
                  fontSize: '11px',
                }}
              >
                {status?.configuredModel || 'gemma4:e2b'}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Main IADE Navigation Bar */}
      <nav className="iade-main-nav">
        <div className="iade-brand-group">
          <a
            href="https://www.iade.europeia.pt/"
            target="_blank"
            rel="noreferrer"
            title="IADE Creative University"
          >
            <IadeLogoSvg />
          </a>
          <div className="iade-brand-divider" />
          <div className="iade-portal-badge">
            <span className="iade-portal-kicker">Step 06 (Optional) • Student Portal</span>
            <span className="iade-portal-title">
              AI Exam Prep &amp; Socratic Assessment
            </span>
          </div>
        </div>

        {/* Area Navigation Links (Inspired by IADE Licenciaturas Menu) */}
        <div className="iade-nav-areas" role="tablist" aria-label="Study Areas">
          {areaList.map((a) => {
            const isSelected = a === area;
            return (
              <button
                key={a}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectArea(a)}
                className={`iade-nav-area-btn ${isSelected ? 'active' : ''}`}
              >
                <span>{a.toUpperCase()}</span>
                <span className="iade-new-tag">data/{a}</span>
              </button>
            );
          })}
        </div>

        <div className="iade-nav-actions">
          <button
            type="button"
            onClick={onToggleCustomParamBox}
            className={`iade-btn iade-btn-sm ${
              customContent?.trim() ? 'iade-btn-mint' : 'iade-btn-outline'
            }`}
          >
            {customContent?.trim()
              ? 'Custom Notes Active'
              : showCustomParamBox
                ? 'Close Custom Notes'
                : '+ Custom Notes Parameter'}
          </button>
        </div>
      </nav>

      {/* Collapsible Custom Markdown Parameter Box */}
      {showCustomParamBox && (
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 28px 18px',
          }}
        >
          <div
            style={{
              background: 'var(--ui02)',
              border: '1px solid var(--border-light)',
              borderLeft: '4px solid var(--brand4)',
              padding: '14px 18px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
                fontSize: '12.5px',
              }}
            >
              <span>
                <strong>Optional <code>customContent</code> Parameter:</strong> Paste custom study notes below to override <code>data/{area}/</code> across Step 05 API calls:
              </span>
              {customContent?.trim() && (
                <button
                  type="button"
                  onClick={() => onChangeCustomContent('')}
                  className="iade-btn iade-btn-outline iade-btn-sm"
                >
                  Reset to data/{area}/
                </button>
              )}
            </div>
            <MarkdownBox
              label="Custom Study Notes (Markdown)"
              badge="customContent"
              value={customContent}
              onChange={onChangeCustomContent}
              defaultMode="split"
              rows={4}
              minHeight="80px"
              placeholder={`# Custom Notes for ${getAreaDefault(area).label}\n\nPaste Markdown notes here to generate exam questions and grade answers from your own text...`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
