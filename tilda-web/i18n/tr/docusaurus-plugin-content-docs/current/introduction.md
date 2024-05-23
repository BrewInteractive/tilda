---
sidebar_position: 1
---

# Giriş

<p  align="center">
<a  href="http://brewww.com/"  target="_blank"><img  src="../img/brew-logo.png"  width="300"  alt="Brew Logo"  /></a>
</p>

<h1  align="center">Tilda Form Doğrulayıcı</h1>

<p align="center">Tilda, Brew Interactive tarafından özel bir manifest ile form verilerini doğrulamak için tasarlanmış, Nest.js tabanlı bir rest API'dir. </p>
<p align="center">
<a href="https://sonarcloud.io/summary/overall?id=BrewInteractive_tilda" target="_blank"><img src="https://sonarcloud.io/api/project_badges/measure?project=BrewInteractive_tilda&metric=alert_status"/></a>
<a href="https://sonarcloud.io/summary/overall?id=BrewInteractive_tilda" target="_blank"><img src="https://sonarcloud.io/api/project_badges/measure?project=BrewInteractive_tilda&metric=coverage"/></a>
</p>
<p align="center">  
<a href="https://www.instagram.com/brew_interactive/" target="_blank"><img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" /></a>
<a href="https://www.linkedin.com/company/brew-interactive/" target="_blank"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="Linkedin" /></a>
<a href="https://twitter.com/BrewInteractive" target="_blank"><img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="Twitter" /></a>
</p>

## Amaç
&nbsp;&nbsp;&nbsp;&nbsp;Projenin amacı, çevrimiçi formların ve kullanıcı tarafından gönderilen verilerin yönetimini kolaylaştırmak ve geliştirmektir. Ana işlevler şunları içerir:

**1. Dinamik Form İşleme:** Proje, kullanıcıların ihtiyaçlarına göre özelleştirilmiş formlar tasarlayıp dağıtabilmeleri için dinamik formların sorunsuz bir şekilde oluşturulmasını ve yönetilmesini sağlar.

**2. Veri Güvenliği:** HMAC ve anahtar çiftlerinin kullanımı ile proje, manifest dosyalarının bütünlüğünü ve özgünlüğünü garanti altına alır, dosyaların değiştirilmemiş ve verilerin orijinal olduğunu doğrulamak için güvenli bir mekanizma sunar.

**3. Şifrelenmiş Değişkenler ve Sabitler:** Şifreleme anahtarları veya e-posta adresleri gibi hassas bilgiler, manifest dosyası içinde şifreleme kullanılarak güvenli bir şekilde saklanabilir ve iletilebilir, kritik verilere ek bir koruma katmanı ekler.

**4. Doğrulama Çerçevesi:** Sistem, form girişleri için güçlü bir doğrulama çerçevesi içerir ve kullanıcıların veri bütünlüğü için kurallar tanımlamasına olanak tanır. Basit boş olmayan alan kontrollerinden karmaşık regex doğrulamalarına kadar, sistem veri doğruluğunu sağlamak için esneklik sunar.

**5. Web-hook Entegrasyonu:** Proje, ön işleme web-hook'ları aracılığıyla harici hizmetlerle sorunsuz bir şekilde entegre olur. Bu özellik, kullanıcıların verileri zenginleştirmesine, harici hizmetler kullanarak doğrulama yapmasına veya formu işlemden önce üçüncü taraf sistemlerle entegrasyon sağlamasına olanak tanır.

**6. Son İşleme Hook'ları:** Form işlendiğinde sonra proje, e-posta bildirimleri ve günlükleme gibi son işleme hook'larını destekler, kullanıcıların daha fazla işlem ve bildirim seçenekleri sunar.

**7. Manifest İmza Doğrulaması:** Sistem, manifest dosyalarının imzalarını ilişkili özel anahtarlarla doğrulayarak dosyaların bütünlüğünü sağlar. Bu, manifest dosyalarındaki yetkisiz değişiklikleri önlemeye yardımcı olur ve veri işleme akışının güvenilirliğini sağlar.

**8. Kullanıcı Dostu Günlükleme:** Ön işleme hook'ları kullanıcı etkileşimleri için yükler dönebilirken, son işleme hook'ları kapsamlı bir günlükleme sistemine katkıda bulunur, kullanıcıların form işleme süreçlerini verimli bir şekilde izlemelerine ve takip etmelerine olanak tanır.

**9. Ölçeklenebilirlik ve Özelleştirme:** Proje, çeşitli kullanım durumlarına uygun olarak ölçeklenebilir ve özelleştirilebilir olarak tasarlanmıştır. Kullanıcılar, sistemi özel gereksinimlerine uyacak şekilde adapte edebilir, çeşitli formları yönetmek ve kullanıcı tarafından gönderilen verileri güvenli bir şekilde işlemek için çok yönlü bir çözüm sunar.

Özetle, proje, dinamik formları yönetmek, veri güvenliğini sağlamak ve form doğrulama ve işleme konusunda esneklik sağlamak için kapsamlı bir çözüm sunmayı hedefler, bu da geniş bir uygulama yelpazesi için uygundur.

## Sonuç

Bu talimatlar, tilda projesini başlatmanıza, yapılandırmanıza, test etmenize ve kullanmanıza yardımcı olacaktır. Proje, form veri doğrulaması gerektiren herhangi bir projede kullanılabilir.
