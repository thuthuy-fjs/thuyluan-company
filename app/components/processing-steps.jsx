import { ChevronDown } from "lucide-react";
import { Eyebrow } from "./site";
import { processingGroups, processingText } from "../processing-data";

export default function ProcessingSteps() {
  return (
    <section id="quy-trinh-che-bien" className="processing-section wrap" aria-labelledby="processing-title">
      <div className="processing-heading">
        <div>
          <Eyebrow>{processingText.eyebrow}</Eyebrow>
          <h2 id="processing-title">
            <span data-editor-id="about.processing.text.heading1">{processingText.heading1}</span>
            <br />
            <span data-editor-id="about.processing.text.heading2">{processingText.heading2}</span>
          </h2>
        </div>
        <p data-editor-id="about.processing.text.description">
          {processingText.description}
        </p>
      </div>

      {processingGroups.map((group) => (
        <div className="processing-group" key={group.title}>
          <h3 className="processing-zone"><span data-editor-id={`about.processing.groups.${group.id}.title`}>{group.title}</span></h3>
          <div className="processing-list">
            {group.steps.map((step) => (
              <details className="processing-step" key={step.number}>
                <summary>
                  <span className="processing-step-photo">
                    <img src={step.image} alt={step.imageAlt} loading="lazy" />
                    <span className="processing-step-number" aria-hidden="true">{step.number}</span>
                  </span>
                  <span className="processing-step-overview">
                    <span className="processing-step-title" data-editor-id={`about.processing.groups.${group.id}.steps.${step.id}.title`}>{step.title}</span>
                    <span className="processing-step-highlights">
                      {step.highlights.map((highlight, index) => <span key={index} data-editor-id={`about.processing.groups.${group.id}.steps.${step.id}.highlights.${index}`}>{highlight}</span>)}
                    </span>
                    <span className="processing-step-prompt">
                      <span className="processing-prompt-open" data-editor-id="about.processing.text.openPrompt">{processingText.openPrompt}</span>
                      <span className="processing-prompt-close" data-editor-id="about.processing.text.closePrompt">{processingText.closePrompt}</span>
                      <ChevronDown size={18} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                  </span>
                </summary>
                <div className="processing-step-detail">
                  <h4 data-editor-id="about.processing.text.actionHeading">{processingText.actionHeading}</h4>
                  <ol>
                    {step.actions.map((action, index) => <li key={index} data-editor-id={`about.processing.groups.${group.id}.steps.${step.id}.actions.${index}`}>{action}</li>)}
                  </ol>
                </div>
              </details>
            ))}
          </div>
        </div>
      ))}

      <p className="processing-reminder">
        {processingText.reminders.map((text, index) => <span key={index} data-editor-id={`about.processing.text.reminders.${index}`}>{text}</span>)}
      </p>
    </section>
  );
}
