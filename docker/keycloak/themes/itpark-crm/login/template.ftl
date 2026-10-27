<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false>
<!DOCTYPE html>
<html lang="${lang!"en"}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>Ethiopian IT Park • Enterprise CRM Portal</title>
    <link rel="icon" type="image/x-icon" href="${url.resourcesPath}/img/favicon.ico" />
    <link rel="stylesheet" href="${url.resourcesPath}/css/login.css" />
</head>
<body class="itpark-login-page">

<div class="itpark-container">
    <!-- Brand Header -->
    <div class="itpark-brand">
        <div class="itpark-brand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
            </svg>
        </div>
        <h1 class="itpark-brand-title">Ethiopian IT Park</h1>
        <p class="itpark-brand-subtitle">Enterprise CRM Portal</p>
    </div>

    <!-- Main Card -->
    <div class="itpark-card">
        <div class="itpark-card-header">
            <h2 class="itpark-card-title">Sign in to your account</h2>
            <p class="itpark-card-description">Enter your credentials to access the CRM system.</p>
        </div>

        <!-- Alert Banner (Error/Info Messages from Keycloak) -->
        <#if displayMessage && message?has_content && (message.type != 'warning')>
            <div class="itpark-alert">
                <span class="itpark-alert-title">${kcSanitize(message.summary)?no_esc}</span>
            </div>
        </#if>

        <!-- Nested Content (Login Form & Social Buttons) -->
        <#nested "form">
    </div>

    <!-- Security Notice Footer -->
    <div class="itpark-footer">
        <p>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
            </svg>
            <span>Official Platform • Ethiopian IT Park Corporation &copy; 2026</span>
        </p>
    </div>
</div>

</body>
</html>
</#macro>
