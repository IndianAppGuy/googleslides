// App.tsx
import React from 'react';
import PresentationEditor from './presentationEditor';

const sampleData = {
  presentationTitle: "Q4 2024 Business Review",
  presentationSubtitle: "Financial Performance and Strategic Initiatives",
  slides: [
    {
      title: "Financial Overview",
      sections: [
        {
          title: "Revenue Growth",
          description: "Q4 revenue showed a 15% YoY growth, driven by strong performance in our enterprise segment and new product launches."
        },
        {
          title: "Profit Margins",
          description: "Operating margins improved by 300 basis points through operational efficiency initiatives and strategic cost management."
        },
        {
          title: "Cash Flow",
          description: "Strong free cash flow generation of $50M, representing a 25% increase from previous quarter."
        }
      ]
    },
    {
      title: "Market Analysis",
      sections: [
        {
          title: "Market Share",
          description: "Gained 2.5% market share in core segments, maintaining leadership position in key markets."
        },
        {
          title: "Competitive Landscape",
          description: "Successfully defended market position against new entrants through product innovation and customer service excellence."
        }
      ]
    },
    {
      title: "Strategic Initiatives",
      sections: [
        {
          title: "Digital Transformation",
          description: "Launched new digital platform reaching 100K users in first month. Enhanced customer engagement metrics by 40%."
        },
        {
          title: "Operational Excellence",
          description: "Implemented AI-driven automation reducing processing time by 60% and improving accuracy to 99.9%."
        },
        {
          title: "Sustainability",
          description: "Achieved 30% reduction in carbon emissions through green energy initiatives and sustainable practices."
        }
      ]
    }
  ]
};

const App = () => {
  return (
    <div className="min-h-screen">
      <PresentationEditor initialData={sampleData} />
    </div>
  );
};

export default App;