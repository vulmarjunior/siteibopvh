import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  image = '/images/serie-da-ascensao-a-parousia/og-image.jpg',
  url = '/da-ascensao-a-parousia',
}) => {
  const baseUrl = 'https://www.ibopvh.com.br';
  const fullUrl = `${baseUrl}${url}`;
  const fullImage = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="Igreja Batista Olaria" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
    </Helmet>
  );
};
