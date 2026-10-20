terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
}

data "aws_caller_identity" "current" {}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_security_group" "task_board" {
  name        = "task-board-terraform-sg"
  description = "Security group for the DevOps Task Board"
  vpc_id      = "vpc-0b97ad0af756e36f9"

  ingress {
    description = "SSH from my current IP only"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["49.43.106.246/32"]
  }

  ingress {
    description = "HTTP for the Task Board"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "task-board-terraform-sg"
    Project = "devops-task-board"
  }
}

resource "aws_instance" "task_board" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = "t3.small"
  subnet_id                   = "subnet-0cb8826692b1fd1bc"
  vpc_security_group_ids      = [aws_security_group.task_board.id]
  key_name                    = "task-board-terraform"
  associate_public_ip_address = true

  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  tags = {
    Name    = "task-board-terraform"
    Project = "devops-task-board"
  }
}

output "aws_account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "aws_user_arn" {
  value = data.aws_caller_identity.current.arn
}

output "instance_id" {
  value = aws_instance.task_board.id
}

output "public_ip" {
  value = aws_instance.task_board.public_ip
}

output "public_dns" {
  value = aws_instance.task_board.public_dns
}
