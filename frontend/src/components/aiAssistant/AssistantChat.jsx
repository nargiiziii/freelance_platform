import React, { useState, useRef } from "react";
import style from "./AssistantChat.module.scss";
import { IoChatbubbleEllipsesSharp, IoCloseSharp } from "react-icons/io5";

const AssistantChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Salam! Mən FreelaBot! Bu platformadan istifadə ilə bağlı sizə kömək edə bilərəm 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });

  const dragRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const systemPrompt = `
Sən — bu frilans platformasının nəzakətli və aydın danışan köməkçisisən. İstifadəçinin roluna əsasən ona məlumat ver.Sualina esasen qisa cavablar ver, layiheye aid ne sual verse konkret sualina cavab ver.

Əgər istifadəçi yazırsa: "mən işəgötürənəm" və ya "frilanserəm", bunu izah et:

Platformada işəgötürənlər layihə yaradır — bu, frilanserlərin yerinə yetirdiyi tapşırıqlardır. Layihə yaradıldıqdan sonra frilanserlər müraciət göndərir. İşəgötürən bu müraciətləri qəbul və ya rədd edə bilər. Əgər müraciət qəbul olunarsa, işəgötürənin balansından vəsait eskro hesabına köçürülür. Frilanser işi yerinə yetirməyə başlayır. İş tamamlandıqda, frilanser nəticəni göndərir. İşəgötürən "Layihə detalları" səhifəsinə keçərək:
— işi təsdiqləyib ödənişi frilanserə göndərə,
— və ya işi rədd edib pulu balansına qaytara bilər.

Əgər istifadəçi yazırsa: "mən frilanserəm", bunu izah et:

Frilanserlər açıq layihələr siyahısına keçə bilər. Maraqlı layihəni seçib müraciət göndərirlər. Əgər müraciət qəbul olunarsa — iş başlayır. Frilanser tapşırığı yerinə yetirib nəticəni "Müraciətlərim" səhifəsi vasitəsilə göndərir. Bundan sonra işəgötürən işi ya təsdiqləyib ödəniş edir, ya da rədd edir.

Əgər sual platforma ilə bağlı deyilsə (məsələn, hava haqqında və ya fəlsəfi sual), nəzakətlə imtina et və bildir ki, sən yalnız saytın funksionallığı üzrə kömək edə bilərsən.
Cavabların səmimi, aydın və qısa olsun.
`;

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "user", parts: [{ text: input }] },
          ],
        }),
      });

      const data = await res.json();
      const reply = data.reply || "Bağışlayın, sualı başa düşmədim 😢";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Xəta baş verdi 😵" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseDown = (e) => {
    isDragging.current = false;
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    if (!open && !isDragging.current) {
      setOpen(true);
    }
  };

  return (
    <div
      ref={dragRef}
      className={style.wrapper}
      style={{ left: position.x, top: position.y }}
    >
      {open ? (
        <div className={style.chatBox}>
          <div className={style.header} onMouseDown={handleMouseDown}>
            <span>🤖 FreelaBot </span>
            <button
              className={style.closeButton}
              onClick={() => setOpen(false)}
            >
              <IoCloseSharp />
            </button>
          </div>
          <div className={style.messages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.role === "user" ? style.userMsg : style.aiMsg}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div className={style.aiMsg}>Yazır...</div>}
          </div>
          <div className={style.inputBox}>
            <input
              type="text"
              placeholder="Sualını yaz..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Göndər</button>
          </div>
        </div>
      ) : (
        <button
          className={style.fab}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          title="Köməkçi"
        >
          <IoChatbubbleEllipsesSharp />
        </button>
      )}
    </div>
  );
};

export default AssistantChat;
