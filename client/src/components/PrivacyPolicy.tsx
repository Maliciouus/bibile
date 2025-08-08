const PrivacyPolicy = () => {
  return (
    <div className='max-w-3xl mx-auto p-6 md:p-12'>
      <h1 className='text-3xl font-bold mb-6'>Privacy Policy</h1>
      <p className='font-semibold mb-8'>Last Updated: March 28, 2025</p>

      <p className='mb-6'>
        This Privacy Policy explains how we collect, use, and protect your
        personal information when you use our Bible app.
      </p>

      <h2 className='text-2xl font-semibold mb-4'>Information We Collect</h2>
      <ul className='list-disc list-inside mb-6'>
        <li>
          **Personal Information:** Name, email address (if you choose to
          provide it)
        </li>
        <li>
          **Usage Data:** Information about how you use the app, such as the
          features you access and the time you spend on the app
        </li>
        <li>
          **Device Information:** Device type, operating system, and unique
          device identifiers
        </li>
      </ul>

      <h2 className='text-2xl font-semibold mb-4'>
        How We Use Your Information
      </h2>
      <ul className='list-disc list-inside mb-6'>
        <li>To provide and improve our services</li>
        <li>To personalize your experience within the app</li>
        <li>To communicate with you about updates and features</li>
        <li>To ensure the security and integrity of our app</li>
      </ul>

      <h2 className='text-2xl font-semibold mb-4'>Sharing Your Information</h2>
      <p className='mb-6'>
        We do not sell or share your personal information with third parties
        except in the following cases:
      </p>
      <ul className='list-disc list-inside mb-6'>
        <li>With service providers who help us operate the app</li>
        <li>When required by law or to protect our rights</li>
      </ul>

      <h2 className='text-2xl font-semibold mb-4'>Your Rights</h2>
      <p className='mb-6'>You have the right to:</p>
      <ul className='list-disc list-inside mb-6'>
        <li>Access and correct your personal information</li>
        <li>Request deletion of your personal information</li>
        <li>Opt-out of marketing communications</li>
      </ul>

      <h2 className='text-2xl font-semibold mb-4'>Security</h2>
      <p className='mb-6'>
        We implement appropriate security measures to protect your personal
        information from unauthorized access, disclosure, alteration, or
        destruction.
      </p>

      <h2 className='text-2xl font-semibold mb-4'>Changes to This Policy</h2>
      <p className='mb-6'>
        We may update this Privacy Policy from time to time. The latest version
        will always be available within the app.
      </p>

      <h2 className='text-2xl font-semibold mb-4'>Contact Us</h2>
      <p className='mb-6'>
        If you have any questions or concerns about our Privacy Policy, please
        contact us at{" "}
        <a
          href='mailto:contact@example.com'
          className='text-blue-500 hover:underline'>
          contact@example.com
        </a>
        .
      </p>
    </div>
  );
};

export default PrivacyPolicy;
