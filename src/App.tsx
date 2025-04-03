import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Card, CardContent } from "./component/ui/card";
import { Button } from "./component/ui/button";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";

const App = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Thai Editor with extensions like Bold and Italic
  const thaiEditor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
    ],
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
    setError(null); // Reset error message before new request

    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API key is missing. Please set REACT_APP_GEMINI_API_KEY in your environment.");
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Translate the following Thai text to English, MUST contain only translated and format: ${thaiEditor.getHTML()}`, // ใช้ getHTML() เพื่อรักษาฟอร์แมต
                  },
                ],
              },
            ],
          }),
        }
      );

      // ตรวจสอบว่า request สำเร็จหรือไม่
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Translation failed: ${errorData.error?.message || "Unknown error"}`);
      }

      const data = await response.json();

      // Log the response to see its structure
      console.log("API Response:", data);

      // Access the translation from the candidates array
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
        const translatedText = data.candidates[0].content.parts[0].text; // The translated text is here
        englishEditor?.commands.setContent(translatedText); // ใส่เนื้อหาที่แปลแล้วเข้า editor
      } else {
        throw new Error("No translation received from the API.");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
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
          <h2 className="text-lg font-bold mb-2">แปลภาษาไทยเป็นอังกฤษ</h2>

          <div className="flex gap-4 mb-4">
            {/* Thai Editor */}
            <div className="flex-1">
              <h3 className="font-medium">ภาษาไทย</h3>
              <EditorContent
                editor={thaiEditor}
                className="border-2 border-gray-300 p-4 rounded-lg shadow-sm"
              />
              {/* Add buttons for formatting */}
              <div className="mt-4">
                <Button onClick={() => thaiEditor?.commands.toggleBold()} className="mr-2">
                  B
                </Button>
                <Button onClick={() => thaiEditor?.commands.toggleItalic()} className="mr-2">
                  I
                </Button>
              </div>
            </div>

            {/* English Editor */}
            <div className="flex-1">
              <h3 className="font-medium">English</h3>
              <EditorContent
                editor={englishEditor}
                className="border-2 border-gray-300 p-4 rounded-lg shadow-sm"
              />
            </div>
          </div>

          {error && <p className="text-red-500">{error}</p>} {/* แสดงข้อผิดพลาด */}

          <Button onClick={translateText} disabled={loading} className="mt-2">
            {loading ? "กำลังแปล..." : "แปลภาษา"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
