use anyhow::{bail, Context, Result};
use fs_extra::dir;
use fs_extra::dir::CopyOptions;
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use thiserror::Error;

pub(crate) struct Repository {
    name: String,
    owner: String,
    path: PathBuf,
    entry: Option<PathBuf>,
}

impl Repository {
    pub(crate) fn new(
        name: String,
        owner: Option<String>,
        path: PathBuf,
        entry: Option<PathBuf>,
    ) -> Result<Self> {
        if !path.exists() {
            bail!(PublishError::PathDoesNotExist(path));
        }
        match owner {
            Some(owner) => Ok(Self {
                name,
                owner,
                path,
                entry,
            }),
            None => Ok(Self {
                name,
                owner: user()?,
                path,
                entry,
            }),
        }
    }

    pub(crate) fn publish(&self) -> Result<()> {
        verify()?;
        if !self.exists()? {
            self.create()?;
        }
        self.clone_repository()?;
        self.update()?;
        println!("Your files are now published. Please make sure GitHub Pages is enabled for the 'main' branch in your repository settings at: https://github.com/{}/settings/pages", self.repository_name());
        println!(
            "The URL of your published report is: https://{}.github.io/{}/",
            self.owner, self.name
        );
        Ok(())
    }

    fn create(&self) -> Result<()> {
        Command::new("gh")
            .args(["repo", "create", &self.repository_name(), "--public"])
            .output()
            .context("Failed to execute `gh repo create` command")?;
        Ok(())
    }

    pub fn repository_name(&self) -> String {
        format!("{}/{}", self.owner, self.name)
    }

    fn entry(&self) -> Result<()> {
        if let Some(entry) = &self.entry {
            if *entry != PathBuf::from("index.html") {
                let destination = self.path.join("deployment").join("index.html");
                let redirect = format!("<!DOCTYPE html><html><head></head><body><script>window.location.href = \"{}\";</script></body></html>", entry.display());
                fs::write(&destination, redirect).context("Failed to write entry file")?;
            }
        }
        Ok(())
    }

    fn clone_repository(&self) -> Result<()> {
        Command::new("gh")
            .args([
                "repo",
                "clone",
                &self.repository_name(),
                &self.path.join("deployment").display().to_string(),
            ])
            .output()
            .context("Failed to execute `gh repo clone` command")?;
        Ok(())
    }

    pub fn exists(&self) -> Result<bool> {
        let output = Command::new("gh")
            .args(["repo", "view", &self.repository_name()])
            .output()
            .context("Failed to execute `gh repo view` command")?;

        if output.status.success() {
            Ok(true)
        } else {
            Ok(false)
        }
    }

    fn update(&self) -> Result<()> {
        let deployment_path = self.path.join("deployment");

        for entry in
            fs::read_dir(&deployment_path).context("Failed to read deployment directory")?
        {
            let entry = entry.context("Failed to read directory entry")?;
            let entry_path = entry.path();
            if !entry_path.ends_with(".git") && !entry_path.ends_with(".github") {
                if entry_path.is_dir() {
                    fs::remove_dir_all(&entry_path).context("Failed to remove directory")?;
                } else {
                    fs::remove_file(&entry_path).context("Failed to remove file")?;
                }
            }
        }

        for entry in fs::read_dir(&self.path).context("Failed to read source directory")? {
            let entry = entry.context("Failed to read directory entry")?;
            let entry_path = entry.path();
            if entry_path.ends_with("deployment") {
                continue;
            }
            let destination_path = deployment_path.join(entry.file_name());

            if entry_path.is_dir() {
                dir::copy(
                    &entry_path,
                    &destination_path,
                    &CopyOptions {
                        overwrite: true,
                        skip_exist: false,
                        buffer_size: 64000,
                        copy_inside: false,
                        content_only: true,
                        depth: 0,
                    },
                )
                .context(format!("Failed to copy directory: {entry_path:?}"))?;
            } else {
                fs::copy(&entry_path, &destination_path)
                    .context(format!("Failed to copy file: {entry_path:?}"))?;
            }
        }

        self.entry()?;

        let deployment_dir = deployment_path.clone();

        std::env::set_current_dir(&deployment_path)
            .context("Failed to change to deployment directory")?;

        if !deployment_dir.join(".git").exists() {
            Command::new("git")
                .args(["init"])
                .output()
                .context("Failed to initialize Git repository")?;
        }

        Command::new("git")
            .args(["checkout", "-b", "main"])
            .output()
            .context("Failed to create or switch to `main` branch")?;
        Command::new("git")
            .args(["add", "."])
            .output()
            .context("Failed to run `git add .`")?;
        Command::new("git")
            .args(["commit", "-m", "Deploy report"])
            .output()
            .context("Failed to commit changes")?;
        Command::new("git")
            .args(["remote", "add", "origin", &self.repository_name()])
            .output()
            .context("Failed to add remote repository")?;
        Command::new("git")
            .args(["push", "-u", "origin", "main"])
            .output()
            .context("Failed to push to the remote repository")?;
        Ok(())
    }
}

/// Returns the username of the authenticated user.
fn user() -> Result<String> {
    let username = Command::new("git")
        .args(["config", "--get", "user.name"])
        .output()
        .context("Failed to execute `git config` command")?
        .stdout;

    let username = String::from_utf8(username)
        .context("Failed to parse output of `git config` command")?
        .trim()
        .to_string();

    if username.is_empty() {
        bail!("Git user.name is not set.");
    }

    Ok(username)
}

/// Verifies if `gh` is installed and authenticated.
fn verify() -> Result<()> {
    let output = Command::new("gh")
        .arg("--version")
        .output()
        .context("Failed to execute `gh --version` command")?;

    if !output.status.success() {
        bail!("GitHub CLI (`gh`) is not installed. Please install it.");
    }

    if std::env::var("GH_TOKEN").is_ok() || std::env::var("GITHUB_TOKEN").is_ok() {
        return Ok(());
    }

    let output = Command::new("gh")
        .arg("auth")
        .arg("status")
        .output()
        .context("Failed to execute `gh auth status` command")?;

    if !output.status.success() {
        bail!("You are not authenticated with GitHub. Please log in using `gh auth login` or set the GH_TOKEN or GITHUB_TOKEN environment variable.");
    }

    Ok(())
}

#[derive(Error, Debug)]
pub enum PublishError {
    #[error("Path does not exist: {0}")]
    PathDoesNotExist(PathBuf),
}

#[cfg(test)]
mod tests {
    use super::*;
    use anyhow::Result;
    use std::path::PathBuf;

    #[test]
    fn repository_exists_when_command_succeeds() -> Result<()> {
        let repo = Repository::new(
            "datavzrd".to_string(),
            Some("datavzrd".to_string()),
            PathBuf::from("."),
            None,
        )?;
        let output = repo.exists()?;
        assert!(output);
        Ok(())
    }

    #[test]
    fn repository_does_not_exist_when_command_fails() -> Result<()> {
        let repo = Repository::new(
            "nonexistent_repo".to_string(),
            Some("owner".to_string()),
            PathBuf::from("."),
            None,
        )?;
        let output = repo.exists()?;
        assert!(!output);
        Ok(())
    }
}
