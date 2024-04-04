---
sidebar_position: 1
---

<p  align="center">
<a  href="http://brewww.com/"  target="_blank"><img  src="/img/Brew-Logo-Small.png"  width="300"  alt="Brew Logo"  /></a>
</p>

<h1  align="center">Tilda Form Validator</h1>

<p align="center">Tilda is a Nest.js based rest api designed to validate form data with a custom manifest by Brew Interactive. </p>
<p align="center">
<a href="https://sonarcloud.io/summary/overall?id=BrewInteractive_tilda" target="_blank"><img src="https://sonarcloud.io/api/project_badges/measure?project=BrewInteractive_tilda&metric=alert_status"/></a>
<a href="https://sonarcloud.io/summary/overall?id=BrewInteractive_tilda" target="_blank"><img src="https://sonarcloud.io/api/project_badges/measure?project=BrewInteractive_tilda&metric=coverage"/></a>
</p>
<p align="center">  
<a href="https://www.instagram.com/brew_interactive/" target="_blank"><img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram" /></a>
<a href="https://www.linkedin.com/company/brew-interactive/" target="_blank"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="Linkedin" /></a>
<a href="https://twitter.com/BrewInteractive" target="_blank"><img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="Twitter" /></a>
</p>

## Purpose
The purpose of the project is to streamline and enhance the management of online forms and user-submitted data. Key functionalities include:

1. Dynamic Form Handling: The project allows for the seamless creation and handling of dynamic forms, empowering users to design and deploy forms tailored to their specific needs.

2. Data Security: With the use of HMAC and key pairs, the project ensures the integrity and authenticity of manifest files, offering a secure mechanism to verify the unchanged nature of the files and the originality of the data.

3. Encrypted Variables and Constants: Sensitive information, such as encryption keys or email addresses, can be securely stored and transmitted by leveraging encryption within the manifest file, adding an extra layer of protection to critical data.

4. Validation Framework: The system incorporates a robust validation framework for form inputs, allowing users to define rules for data integrity. From simple checks like non-empty fields to complex regex validations, the system provides flexibility in ensuring data accuracy.

5. Web-hooks Integration: The project seamlessly integrates with external services through pre-processing web-hooks. This feature enables users to enrich data, perform validations using external services, or integrate with third-party systems before handling the form.

6. Post-processing Hooks: After the form is handled, the project supports post-processing hooks like email notifications and logging, providing users with versatile options for further processing and notification.

7. Manifest Signature Verification: The system ensures the integrity of manifest files by validating their signatures against associated private keys. This helps prevent unauthorized changes to the manifest files and ensures the reliability of the data processing flow.

8. User-Friendly Logging: While pre-processing hooks can return payloads for user interactions, post-processing hooks contribute to a comprehensive logging system, allowing users to track and monitor form handling processes efficiently.

9. Scalability and Customization: The project is designed to be scalable and customizable, catering to diverse use cases. Users can adapt the system to their specific requirements, making it a versatile solution for managing various forms and processing user-submitted data securely.

In summary, the project aims to offer a comprehensive solution for managing dynamic forms, ensuring data security, and providing flexibility in form validation and processing, making it suitable for a wide range of applications.

## Documents

- [Tilda Deployment](https://github.com/BrewInteractive/tilda/blob/main/docs/deploy.md)
  - [Deploying With Docker Compose](https://github.com/BrewInteractive/tilda/blob/main/docs/deploy.md#deploying-with-docker-compose)
- [Local Development Instructions](https://github.com/BrewInteractive/tilda/blob/main/docs/local_development.md)
  - [Redis Run With Docker](https://github.com/BrewInteractive/tilda/blob/main/docs/local_development.md#redis-run-with-docker)
  - [Running Tests](https://github.com/BrewInteractive/tilda/blob/main/docs/local_development.md#running-tests)
- [Environment Variables](https://github.com/BrewInteractive/tilda/blob/main/docs/environment_variables.md)
- [Manifest Schema](https://github.com/BrewInteractive/tilda/blob/main/docs/manifest_schema.md)
  - [Example Manifest Schema](https://github.com/BrewInteractive/tilda/blob/main/docs/manifest_schema.md#example-manifest-schema)
  - [Fields](https://github.com/BrewInteractive/tilda/blob/main/docs/manifest_schema.md#fields)
    - [Properties](https://github.com/BrewInteractive/tilda/blob/main/docs/manifest_schema.md#properties)
  - [Validating Inputs](https://github.com/BrewInteractive/tilda/blob/main/docs/manifest_schema.md#validating-inputs)
    - [Alpha Validator](https://github.com/BrewInteractive/tilda/blob/main/docs/manifest_schema.md#alpha-validator)
    - [Numeric Validator](https://github.com/BrewInteractive/tilda/blob/main/docs/manifest_schema.md#numeric-validator)
    - [Alpha-Numeric Validator](https://github.com/BrewInteractive/tilda/blob/main/docs/manifest_schema.md#alpha-numeric-validator)
    - [Regex Validator](https://github.com/BrewInteractive/tilda/blob/main/docs/manifest_schema.md#regex-validator)
    - [Length Validator](https://github.com/BrewInteractive/tilda/blob/main/docs/manifest_schema.md#length-validator)
    - [NotEmpty Validator](https://github.com/BrewInteractive/tilda/blob/main/docs/manifest_schema.md#notempty-validator)
    - [Enum Validator](https://github.com/BrewInteractive/tilda/blob/main/docs/manifest_schema.md#enum-validator)
  - [Hooks for Further Processing](https://github.com/BrewInteractive/tilda/blob/main/docs/manifest_schema.md#hooks-for-further-processing)
    - [Pre-processing Hooks](https://github.com/BrewInteractive/tilda/blob/main/docs/manifest_schema.md#pre-processing-hooks)
    - [Post-processing Hooks](https://github.com/BrewInteractive/tilda/blob/main/docs/manifest_schema.md#post-processing-hooks)
    - [Built-in Hook Types](https://github.com/BrewInteractive/tilda/blob/main/docs/manifest_schema.md#build-in-hook-types)
- [API Reference](https://github.com/BrewInteractive/tilda/blob/main/docs/api_reference.md)

## Conclusion

These instructions will help you start, configure, test, and use the tilda project. The project can be used in any project that requires form data validation.

## License

Tilda is [MIT licensed](LICENSE).
