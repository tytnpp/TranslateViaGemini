import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import { Card, CardContent } from "./component/ui/card";
import { Button } from "./component/ui/button";

const Section = ({
  title,
  thaiEditor,
  englishEditor,
}: {
  title: string;
  thaiEditor: any;
  englishEditor: any;
}) => (
  <div className="mb-8">
    <h3 className="font-semibold mb-2">{title}</h3>
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium mb-1">ภาษาไทย</p>
        <EditorContent
          editor={thaiEditor}
          className="border border-gray-300 rounded p-3 min-h-[120px]"
        />
        <div className="mt-2">
          <Button
            onClick={() => thaiEditor?.commands.toggleBold()}
            className="mr-2"
          >
            <strong>B</strong>
          </Button>
          <Button onClick={() => thaiEditor?.commands.toggleItalic()}>
            <em>I</em>
          </Button>
        </div>
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium mb-1">English</p>
        <EditorContent
          editor={englishEditor}
          className="border border-gray-300 rounded p-3 min-h-[120px] bg-gray-50"
        />
      </div>
    </div>
  </div>
);

const App = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔸 Editor แต่ละช่อง
  const thaiIntro = useEditor({ extensions: [StarterKit, Bold, Italic], content: "" });
  const engIntro = useEditor({ extensions: [StarterKit], content: "", editable: false });

  const thaiDetail = useEditor({ extensions: [StarterKit, Bold, Italic], content: "" });
  const engDetail = useEditor({ extensions: [StarterKit], content: "", editable: false });

  const thaiNote = useEditor({ extensions: [StarterKit, Bold, Italic], content: "" });
  const engNote = useEditor({ extensions: [StarterKit], content: "", editable: false });

  // 🔁 แปลทีละช่อง
  const translateSection = async (thaiEditor: any, englishEditor: any) => {
    const html = thaiEditor?.getHTML();
    if (!html) return;

    const response = await fetch("http://localhost:8080/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalHtml: html }),
    });

    if (response.ok) {
      const data = await response.json();
      englishEditor?.commands.setContent(data.translatedHtml);
    }
  };

  // 🔁 แปลทั้งหมด
  const translateAll = async () => {
    if (!thaiIntro || !thaiDetail || !thaiNote) return;

    setLoading(true);
    setError(null);

    try {
      await translateSection(thaiIntro, engIntro);
      await translateSection(thaiDetail, engDetail);
      await translateSection(thaiNote, engNote);
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการแปล");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-6">แปลข้อความหลายช่อง</h2>

          <Section
            title="🔹 คำโปรย (Intro)"
            thaiEditor={thaiIntro}
            englishEditor={engIntro}
          />

          <Section
            title="🔹 รายละเอียด (Details)"
            thaiEditor={thaiDetail}
            englishEditor={engDetail}
          />

          <Section
            title="🔹 หมายเหตุ (Notes)"
            thaiEditor={thaiNote}
            englishEditor={engNote}
          />

          {error && <p className="text-red-500 mt-2">{error}</p>}

          <Button onClick={translateAll} disabled={loading}>
            {loading ? "กำลังแปลทั้งหมด..." : "แปลข้อความทั้งหมด"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
