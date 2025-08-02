"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const InvitePage = () => {
  const { code } = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!code) {
      setMessage("Geçersiz veya eksik davet bağlantısı.");
    }
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setMessage("Geçersiz bağlantı.");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `http://localhost:8000/api/groups/join/${code}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, surname, phone_number: phone, email }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("🎉 Başarıyla kayıt oldunuz!");
        setName("");
        setSurname("");
        setPhone("");
        setEmail("");
      } else {
        setMessage(
          data.detail || data.message || "Kayıt sırasında bir hata oluştu."
        );
      }
    } catch (err) {
      setMessage("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Gruba Katıl</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ad</label>
            <input
              type="text"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
              placeholder="Adınızı girin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Soyad</label>
            <input
              type="text"
              value={surname}
              required
              onChange={(e) => setSurname(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
              placeholder="Soyadınızı girin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Telefon</label>
            <input
              type="tel"
              value={phone}
              required
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
              placeholder="05xxxxxxxxx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">E-posta</label>
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
              placeholder="E-posta adresiniz"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Gönderiliyor..." : "Gruba Katıl"}
          </button>

          {message && (
            <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default InvitePage;
