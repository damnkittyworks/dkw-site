---
layout: post.njk
title: OpenClaw install on an old Dell laptop
excerpt: First pass at getting OpenClaw running on a wiped Ubuntu Dell from a normie-can-do perspective.
draft: false
hideHistory: false
permalink: /posts/openclaw-install-dell/
---

It’s Saturday, March 7, 2026, and I’m finally giving OpenClaw a try.

I’ve been reading about OpenClaw on X.com for a while, back when it was still called Clawdbot. There are two main things I want to use it for: research and fleshing out ideas, and having it operate a physical device.

On the research side, I have way too many things I want to work on and it feels like there’s never time. To be honest, I do have time. Procrastination just makes it feel like I don’t. So let’s see what happens if a lot of the research gets handled and my main job becomes evaluating and making decisions.

On the physical device side, I’m really curious about how AI can control robots. That whole area is exciting to me and I want to understand it better, not just read posts about it.

I tend to approach tech with safety and security in mind. I don’t know why, I just do. My first thought was to install it on my daily use M4 Mac mini, but that feels too risky. For what I want to accomplish, does OpenClaw even need a Mac mini? Probably not.

I have some old laptops that aren’t being used for anything important, so that seems like the smarter move. I’m going with a 2017 Dell Latitude 5580, i7, 32GB RAM. I bought it on eBay for under $200. Fresh Ubuntu install. No personal accounts on it. 100% OpenClaw machine.

I asked ChatGPT to help me go through the OpenClaw documentation. I don’t have a formal technical/CS background, so some of my assumptions could be off. And it’s easy to ask dumb questions without feeling awkward about it.

## The plan:
1.	Configure guest access on my Wi-Fi
2.	Get Ubuntu installed on the Dell
3.	Harden the Ubuntu configuration
4.	Install OpenClaw


## Sunday March 8, 2026

First, I configured the guest network on my Wi-Fi. When ChatGPT suggested that, I was confused. Isn’t guest Wi-Fi just open and insecure? Turns out that’s not necessarily true on a home router. A guest network can actually be more secure because it isolates the OpenClaw laptop from the rest of my network. That made a lot of sense once I understood it.
{% details "Nice read on guest Wi-Fi" %}
The Dong Knows Tech website has a page about guest Wi-Fi if you'd like more info: <https://dongknows.com/guest-wi-fi-networking-and-iot-devices/>
{% enddetails %}

Next, I downloaded Ubuntu 24.04.4 LTS instead of the newer 25.10 release. The reasoning was simple: LTS versions usually need less maintenance. That matters because I really don’t want to be hands-on with updates on this laptop.

I installed Ubuntu on the Dell laptop and selected the encryption option during setup.
{% details "To encrypt or not?" %}
Since this laptop is being dedicated to OpenClaw, wiping it and turning on encryption was an easy choice for me.

Your situation might be different. If the laptop also needs to be used for other things, you may need to think through partitions, dual use, or whether full-disk encryption fits your setup.

My thinking was simple: if the laptop were ever lost or stolen while powered off, encryption would help protect whatever is on the drive. 
{% enddetails %}

Then, while I still had admin permissions, I opened Terminal and did the following:
1.	Ran the standard upgrades
```bash
sudo apt update && sudo apt upgrade -y
```
3.	Turned on the firewall
```bash
sudo ufw enable
```
4.	Installed Git and Curl
```bash
sudo apt install -y git curl ca-certificates
```
5.	Installed Node 22+
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install -y nodejs
```
6.	Installed Chrome following the instructions on the browser troubleshooting page <https://docs.openclaw.ai/tools/browser-linux-troubleshooting>
7.	Turned off Automatic Suspend in Settings → Power so OpenClaw can run 24/7
8.	Created a non-admin user with no sudo permissions. I’m calling mine ocbot. Name yours whatever you want.

Then I rebooted and logged in as ocbot.

From there, I:
1.	Opened Chrome and went through the Autofill, Passwords, and Privacy settings. I turned off autosave, unnecessary suggestions, and customized ads.
2.	Opened Terminal and ran the OpenClaw install <https://docs.openclaw.ai/install>:
```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```
3.	Used the OpenAI OAuth option to connect my ChatGPT Plus subscription. Pretty simple.
4.	Selected GPT-5.4 as the model
5.	Skipped Channels for now
6.	Skipped Web Search for now
7.	Skipped Skills for now
8.	Included the **bootstrap-extra-files** and **session-memory** hooks
9.	Skipped hatching the bot for now
10.	After onboarding completed, ran:
```bash
openclaw doctor
```
11. Ran the security audit:
```
openclaw security audit
```
12. Corrected the **openclaw not found** issue :
```
npm prefix -g
echo "$PATH"

echo 'export PATH="$(npm prefix -g)/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
hash -r
```
13. Configured git:
```
git config --global user.name "You"
git config --global user.email "you@example.com"
```

Now I’m at the “hatch your bot” step.

Getting OpenClaw installed was one thing. Figuring out the first useful job to give it is the real next step.



## Current status

Task for the next few days:
hatch the bot.

## Updates

### March 8, 2026, 5:43 PM ET

Documented the openclaw initial install.

### March 7, 2026, 5:10 PM ET

Created the post, defined the goal and setup, and logged the first-day context.
