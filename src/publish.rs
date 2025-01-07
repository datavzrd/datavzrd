use anyhow::{bail, Context, Result};
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use thiserror::Error;

pub(crate) struct Repository {
    name: String,
    owner: String,
    path: PathBuf,
}

impl Repository {
    pub(crate) fn new(name: String, owner: Option<String>, path: PathBuf) -> Result<Self> {
        if !path.exists() {
            bail!(PublishError::PathDoesNotExist(path));
        }
        match owner {
            Some(owner) => Ok(Self { name, owner, path }),
            None => Ok(Self {
                name,
                owner: user()?,
                path,
            }),
        }
    }

    pub(crate) fn publish(&self) -> Result<()> {
        verify()?;
        if !self.exists()? {
            self.create()?;
        }
        self.clone_repository()?;
        self.deploy_action()?;
        self.update()?;
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

    fn deploy_action(&self) -> Result<()> {
        let file = include_str!("../templates/pages.yaml");
        let path = self.path.join("deployment/.github/workflows/pages.yml");
        if !path.exists() {
            fs::write(&path, file)?;
        }
        Ok(())
    }

    fn update(&self) -> Result<()> {
        let deployment_path = self.path.join("deployment");

        for entry in fs::read_dir(&self.path).context("Failed to read report directory")? {
            let entry = entry.context("Failed to read directory entry")?;
            let destination = deployment_path.join(entry.file_name());
            if let Err(_) = fs::remove_file(&destination) {
                // Ignore errors when removing files (e.g., file doesn't exist)
            }

            fs::copy(entry.path(), destination).context("Failed to copy report")?;
        }

        for entry in
            fs::read_dir(&deployment_path).context("Failed to read deployment directory")?
        {
            let entry = entry.context("Failed to read directory entry")?;
            let entry_path = entry.path();
            if entry_path.ends_with(".git") || entry_path.ends_with(".github") {
                continue;
            }
            if entry_path.is_dir() {
                fs::remove_dir_all(&entry_path).context("Failed to remove directory")?;
            } else {
                fs::remove_file(&entry_path).context("Failed to remove file")?;
            }
        }

        std::env::set_current_dir(&deployment_path)
            .context("Failed to change to deployment directory")?;
        Command::new("git")
            .arg("add")
            .arg(".")
            .output()
            .context("Failed to run git add")?;
        Command::new("git")
            .arg("commit")
            .arg("-m")
            .arg("Deploy report")
            .output()
            .context("Failed to run git commit")?;
        Command::new("git")
            .arg("push")
            .output()
            .context("Failed to run git push")?;

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

    let output = Command::new("gh")
        .arg("auth")
        .arg("status")
        .output()
        .context("Failed to execute `gh auth status` command")?;

    if !output.status.success() {
        bail!("You are not authenticated with GitHub. Please log in using `gh auth login`.");
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
        )?;
        let output = repo.exists()?;
        assert!(!output);
        Ok(())
    }
}
