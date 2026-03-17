"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Twitter, Linkedin, Mail, Send, Code2 } from "lucide-react";
import emailjs from '@emailjs/browser';

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !email.includes("@")) {
      setStatus("error");
      setMessage("Zəhmət olmasa düzgün email ünvanı daxil edin");
      return;
    }

    setStatus("loading");
    setMessage("");

    // Təkmilləşdirilmiş HTML Dizayn
    const emailHtmlContent = `
    <!DOCTYPE html>
    <html lang="az">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background-color: #0d1117; 
                color: #ffffff; 
                margin: 0; 
                padding: 0; 
            }
            .container { 
                max-width: 600px; 
                margin: 20px auto; 
                background-color: #161b22; 
                border-radius: 12px; 
                overflow: hidden; 
                border: 1px solid #30363d; 
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); 
            }
            .header { 
                background-color: #0d1117; 
                padding: 40px 30px; 
                text-align: center; 
                border-bottom: 3px solid #2ea043; 
                position: relative; 
            }
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(to bottom, rgba(46, 160, 67, 0.1), transparent);
            }
            .content { 
                padding: 40px 30px; 
                text-align: center; 
            }
            h1 { 
                color: #ffffff; 
                font-size: 32px; 
                margin-bottom: 15px; 
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); 
            }
            .purple { 
                color: #a371f7; 
                text-shadow: 0 1px 2px rgba(163, 113, 247, 0.3); 
            }
            p { 
                color: #c9d1d9; 
                line-height: 1.7; 
                font-size: 16px; 
                margin-bottom: 20px; 
            }
            .highlight { 
                color: #3fb950; 
                font-weight: bold; 
            }
            .button { 
                display: inline-block; 
                padding: 15px 40px; 
                margin-top: 25px; 
                background: linear-gradient(135deg, #2ea043, #238636); 
                color: #ffffff !important; 
                text-decoration: none; 
                border-radius: 8px; 
                font-weight: bold; 
                font-size: 18px; 
                transition: transform 0.2s, box-shadow 0.2s; 
            }
            .button:hover { 
                transform: translateY(-2px); 
                box-shadow: 0 4px 12px rgba(46, 160, 67, 0.4); 
            }
            .footer { 
                background-color: #0d1117; 
                padding: 25px; 
                text-align: center; 
                font-size: 13px; 
                color: #8b949e; 
                border-top: 1px solid #30363d; 
            }
            .code-snippet { 
                background: #010409; 
                padding: 20px; 
                border-radius: 8px; 
                border: 1px solid #30363d; 
                font-family: 'Courier New', monospace; 
                color: #79c0ff; 
                margin: 25px 0; 
                font-size: 15px; 
                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2); 
            }
            .social-icons { 
                margin-top: 20px; 
            }
            .social-icons a { 
                color: #8b949e; 
                margin: 0 10px; 
                text-decoration: none; 
                transition: color 0.2s; 
            }
            .social-icons a:hover { 
                color: #ffffff; 
            }
            @media (max-width: 480px) {
                h1 { font-size: 28px; }
                .button { font-size: 16px; padding: 12px 30px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2 style="margin:0; color:#3fb950; font-size: 36px; letter-spacing: 1px;">HeroCode</h2>
            </div>
            <div class="content">
                <h1>Məntiqi <span class="purple">Zindan</span> Səni Gözləyir!</h1>
                <p>Salam, macəra axtaran <span class="highlight">qəhrəman</span>!</p>
                <p>Proqramlaşdırma məntiqini darıxdırıcı dərslərlə deyil, <strong>Epik RPG macərası</strong> ilə öyrənməyə hazır mısan? HeroCode dünyasında sən sadəcə kod yazmırsan, həm də əsl qəhrəmana çevrilirsən. Hər mərhələdə yeni biliklər qazanıb, düşmənləri məntiqinlə məğlub edəcəksən!</p>
                <div class="code-snippet">
                    const qəhrəman = await questəBaşla();<br>
                    qəhrəman.levelUp(); // Biliklərini artır!
                </div>
                <p>Daha çox mərhələni keçmək və əfsanəvi artefaktlar qazanmaq üçün macəraya qoşul!</p>
                <a href="https://herocodeai.vercel.app/login" class="button">İndi Qeydiyyatdan Keç</a>
            </div>
            <div class="footer">
                &copy; 2026 HeroCode. Bütün hüquqlar qorunur.<br>
                Kod yazaraq dünyanı xilas et! 🚀
                <div class="social-icons">
                    <a href="https://github.com/herocode" target="_blank">GitHub</a> |
                    <a href="https://twitter.com/herocode" target="_blank">Twitter</a> |
                    <a href="https://linkedin.com/company/herocode" target="_blank">LinkedIn</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
      const SERVICE_ID = 'service_pb8ml8n';
      const TEMPLATE_ID = 'template_a24v6lk'; // EmailJS panelində {{{my_html}}} olan şablonun ID-si
      const USER_ID = 'iATJyS6_0e2VpI2Ql';

      const templateParams = {
        subscriber_email: email.trim(),
        my_html: emailHtmlContent, // Bütün dizaynı buradan göndəririk
      };

      const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID);

      if (response.status === 200) {
        setStatus("success");
        setMessage("Abunə olduğun üçün təşəkkür edirik! 🎉");
        setEmail("");
      }
    } catch (err) {
      console.error("Abunə xətası:", err);
      setStatus("error");
      setMessage("Xəta baş verdi. Yenidən cəhd edin.");
    }
  };

  return (
    <footer className="relative pt-16 pb-8 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="dungeon-card rounded-2xl p-10 border border-border mb-12 text-center shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <h3 className="font-display font-bold text-3xl mb-6 tracking-wide">
            <span className="text-foreground">Questə </span>
            <span className="gradient-text-green text-glow">Qoşul</span>
          </h3>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg leading-relaxed">
            Erkən giriş, eksklüziv kodlaşdırma tapşırıqları və RPG-stil yeniliklər üçün abunə ol. Macəra səni gözləyir!
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto items-center">
            <Input
              type="email"
              placeholder="emailin@sənin.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading" || status === "success"}
              className="bg-muted/50 border-border rounded-lg py-6 text-base flex-1"
            />
            <Button 
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="bg-primary hover:bg-primary/90 min-w-[160px] py-6 rounded-lg text-base font-semibold transition-all hover:scale-105"
            >
              {status === "loading" ? "Göndərilir..." : status === "success" ? "Abunə olundu ✓" : (
                <span className="flex items-center gap-2"><Send className="w-5 h-5" /> Abunə Ol</span>
              )}
            </Button>
          </form>

          {status !== "idle" && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-sm font-medium"
            >
              <p className={status === "success" ? "text-green-400" : "text-red-400"}>{message}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Təkmilləşdirilmiş Footer Alt Hissə - Sosial Linklər Əlavə Edildi */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border gap-6">
          <div className="flex items-center gap-3">
            <Code2 className="w-7 h-7 text-primary" />
            <span className="font-bold text-xl">HeroCode</span>
          </div>
         
          <p className="text-sm text-muted-foreground">© 2026 HeroCode. Bütün hüquqlar qorunur.</p>
           <div className="flex gap-6">
            <a href="https://github.com/herocode" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="w-6 h-6" />
            </a>
            <a href="https://twitter.com/herocode" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="https://linkedin.com/company/herocode" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin className="w-6 h-6" />
            </a>
            <a href="mailto:info@herocode.ai" className="text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;