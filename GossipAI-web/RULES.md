# GossipAI Web Rules

Bu repoda herhangi bir iş yapmadan once `AGENTS.md` ile birlikte bu dosyayi oku ve degisiklikleri bu kurallara gore yap.

1. Auth, tema, dil ve diger uygulama state'leri icin `zustand` kullan.
2. Tum UI bilesenleri `src/components/ui` altindaki `shadcn/ui` bilesenleri ile kurulacak.
3. Type tanimlari ve runtime validasyonlar `zod` ile yapilacak.
4. Validasyon hatalari kullaniciya detayli sekilde `sonner` toast ile gosterilecek.
5. API response ve error mesajlari kullanici icin okunur hale getirilip toast ile gosterilecek.
6. Tum API cagirilari `@tanstack/react-query` uzerinden yapilacak.
7. CRUD islemleri sonrasinda ilgili query'ler invalidation veya optimistic update ile guncellenecek. Table/list ekranlari query tabanli calisacak.
8. Auth tarafinda `401` alindiginda once refresh token ile yeni token al. Ilk refresh basarisiz olursa bir kez daha dene. Yine basarisiz olursa kullaniciyi `/login` ekranina yonlendir.
9. Root seviyede `sonner` toaster aktif kalacak.
