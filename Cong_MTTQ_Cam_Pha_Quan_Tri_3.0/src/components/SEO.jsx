import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, image, url }) {
  const siteTitle = title || 'Cổng Thông tin UB MTTQ TP Cẩm Phả';
  const siteDescription = description || 'Cổng thông tin điện tử chính thức của Ủy ban Mặt trận Tổ quốc Việt Nam thành phố Cẩm Phả. Cập nhật tin tức, hoạt động, phong trào thi đua.';
  const siteImage = image || 'https://mttq.vpdtcampha.vn/default-share-image.jpg'; 
  const siteUrl = url || 'https://mttq.vpdtcampha.vn';

  return (
    <Helmet>
      {/* Thẻ meta tiêu chuẩn */}
      <title>{siteTitle}</title>
      <meta name='description' content={siteDescription} />

      {/* Thẻ Open Graph cho Facebook, Zalo chia sẻ */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteImage} />
      <meta property="og:url" content={siteUrl} />
    </Helmet>
  );
}
