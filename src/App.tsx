import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import { Card, CardContent } from "./component/ui/card";
import { Button } from "./component/ui/button";

const App = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Thai Editor (editable)
  const thaiEditor = useEditor({
    extensions: [StarterKit, Bold, Italic],
    content: "",
  });

  // English Editor (non-editable)
  const englishEditor = useEditor({
    extensions: [StarterKit],
    content: "",
    editable: false,
  });

  const translateText = async () => {
    if (!thaiEditor) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalHtml: thaiEditor.getHTML(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Translation failed: ${errorText}`);
      }

      const data = await response.json();
      const translatedText = data.translatedHtml;

      // แสดงผลลัพธ์ที่แปลแล้ว
      englishEditor?.commands.setContent(translatedText);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent>
          <h2 className="text-lg font-bold mb-4">แปลภาษาไทยเป็นอังกฤษ</h2>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Thai Editor */}
            <div className="flex-1">
              <h3 className="font-medium mb-2">ภาษาไทย</h3>
              <EditorContent
                editor={thaiEditor}
                className="border-2 border-gray-300 p-4 rounded-lg shadow-sm min-h-[160px]"
              />
              <div className="mt-4">
                <Button onClick={() => thaiEditor?.commands.toggleBold()} className="mr-2">
                  <strong>B</strong>
                </Button>
                <Button onClick={() => thaiEditor?.commands.toggleItalic()}>
                  <em>I</em>
                </Button>
              </div>
            </div>

            {/* English Editor */}
            <div className="flex-1">
              <h3 className="font-medium mb-2">English</h3>
              <EditorContent
                editor={englishEditor}
                className="border-2 border-gray-300 p-4 rounded-lg shadow-sm min-h-[160px] bg-gray-50"
              />
            </div>
          </div>

          {error && <p className="text-red-500 mt-2">{error}</p>}

          <Button onClick={translateText} disabled={loading} className="mt-2">
            {loading ? "กำลังแปล..." : "แปลภาษา"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;